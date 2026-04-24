"use client";

import { getStoredLinkToken, redirectToOtpPage } from "@/lib/customer-session";

const ORCHESTRATION_API_BASE =
  process.env.NEXT_PUBLIC_ORCHESTRATION_API_URL || "http://localhost:3002";

export type NearbyParcelPoint = {
  id: string | number;
  name: string;
  code?: string | null;
  location?: string | null;
  address?: string | null;
  mobile?: string | null;
  hours?: string | null;
  zip_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number | null;
  branch_code?: string | null;
};

export type DeliveryOptionPayload = {
  option: string;
  deliveryDate?: string;
  additionalInfo?: string;
  safeLocation?: string;
  trustedPersonName?: string;
  trustedPersonMobile?: string;
  alternateAddress?: {
    address1: string;
    address2?: string;
    city: string;
    suburb: string;
    state: string;
    country: string;
    postcode: string;
  };
  parcelPoint?: {
    id: string;
    name: string;
    code?: string;
    branchCode?: string;
  };
  collectionDate?: string | null;
};

const parseJson = async (response: Response) => {
  const payload = await response.json();
  if (payload?.code === "OTP_EXPIRED" || payload?.code === "OTP_REQUIRED") {
    redirectToOtpPage();
    throw new Error(payload.error || "OTP session expired");
  }
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
};

export const fetchAvailableDeliveryDates = async () => {
  const token = getStoredLinkToken();
  const response = await fetch(`${ORCHESTRATION_API_BASE}/api/delivery-options/available`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJson(response);
  return (payload.data?.availableDates || []) as string[];
};

export const fetchNearbyParcelPoints = async (lat: number, lng: number, radiusKm?: number) => {
  const query = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });

  if (radiusKm) {
    query.set("radiusKm", String(radiusKm));
  }

  const response = await fetch(
    `${ORCHESTRATION_API_BASE}/api/locations/upslocations/nearby?${query.toString()}`
  );

  const payload = await parseJson(response);
  return (payload.data || []) as NearbyParcelPoint[];
};

export const submitDeliveryOption = async (body: DeliveryOptionPayload) => {
  const token = getStoredLinkToken();
  const response = await fetch(`${ORCHESTRATION_API_BASE}/api/delivery-options`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  return parseJson(response);
};
