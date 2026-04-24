"use client";

export const getStoredLinkToken = () => {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("parcelpoint_link_token") || "";
};

export const getStoredShipmentId = () => {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem("parcelpoint_shipment_id") || "";
};

export const isOtpVerified = () => {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem("parcelpoint_otp_verified") === "true";
};

export const redirectToOtpPage = () => {
  if (typeof window === "undefined") return;
  const token = getStoredLinkToken();
  window.sessionStorage.removeItem("parcelpoint_otp_verified");
  window.location.href = token ? `/otppage?token=${encodeURIComponent(token)}` : "/otppage";
};
