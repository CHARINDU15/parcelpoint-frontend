"use client";

export type AccessLinkDetailsResponse = {
  success: boolean;
  data?: {
    shipmentId: string;
    deliveryOptionsUntil?: string;
    consignment?: {
      receiver_contact_name?: string;
      receiver_mobile_number?: string;
      receiver_email?: string;
      receiver_address_1?: string;
      receiver_address_2?: string;
      receiver_suburb?: string;
      receiver_city?: string;
      receiver_state?: string;
      receiver_country?: string;
      receiver_postcode?: string;
      delivery_date?: string;
      preferred_delivery_option?: string;
      preferred_notification_channel?: string;
      service_type?: string;
      sender_contact_name?: string;
      sender_mobile_number?: string;
      sender_email?: string;
    };
    items?: Array<{ item_id?: string }>;
    deliveryOptions?: Array<{ preferred_delivery_option?: string }>;
  };
  error?: string;
};

export type AccessLinkConsignment = NonNullable<AccessLinkDetailsResponse["data"]>["consignment"];

export type AccessLinkTokenPayload = {
  shipmentId?: string;
  consignment?: {
    receiverName?: string;
    receiverEmail?: string;
    receiverMobile?: string;
    deliveryDate?: string;
    preferredDeliveryOption?: string | null;
  };
  accessMeta?: {
    expiresAt?: number;
  };
  nonce?: string;
  exp?: number;
};

export type ShipmentCustomerDetailsResponse = {
  success: boolean;
  data?: {
    messageId: string;
    timestamp: number | null;
    isSingle: boolean;
    shipmentType: string | null;
    shipmentId: string;
    deliveryDate: string | null;
    serviceType: string | null;
    serviceIndicator: string | null;
    preferredDeliveryOption: string | null;
    preferredNotificationChannel: string | null;
    deliveryOptionsUntil: string | null;
    packages: Array<{
      packageId: string;
      description: string | null;
      weight: number | null;
      height: number | null;
      width: number | null;
      length: number | null;
      isPrimary: boolean;
    }>;
    receiver: {
      accountNumber: string | null;
      contactName: string | null;
      mobileNumber: string | null;
      emailAddress: string | null;
      address: {
        addressLine1: string | null;
        addressLine2: string | null;
        postalCode: string | null;
        city: string | null;
        suburb: string | null;
        state: string | null;
        country: string | null;
      };
    };
    sender: {
      contactName: string | null;
      mobileNumber: string | null;
      emailAddress: string | null;
    };
  };
  error?: string;
};

export type DashboardShipmentData = {
  estimatedDelivery: string;
  receiver: string;
  shippingNumber: string;
  numberOfPackages: number;
  deliveryAddress: string;
  currentDeliveryOption: string;
  managementDeadline: string;
  shipmentType: string;
  serviceType: string;
  serviceIndicator: string;
  accountNumber: string;
  receiverMobile: string;
  receiverEmail: string;
  senderName: string;
  senderMobile: string;
  senderEmail: string;
  preferredNotificationChannel: string;
  packages: Array<{
    packageId: string;
    description: string;
    weight: string;
    dimensions: string;
    isPrimary: boolean;
  }>;
};

export const emptyDashboardShipmentData: DashboardShipmentData = {
  estimatedDelivery: "N/A",
  receiver: "N/A",
  shippingNumber: "N/A",
  numberOfPackages: 0,
  deliveryAddress: "N/A",
  currentDeliveryOption: "Not selected",
  managementDeadline: "N/A",
  shipmentType: "N/A",
  serviceType: "N/A",
  serviceIndicator: "N/A",
  accountNumber: "N/A",
  receiverMobile: "No mobile available",
  receiverEmail: "No email available",
  senderName: "N/A",
  senderMobile: "N/A",
  senderEmail: "N/A",
  preferredNotificationChannel: "Not selected",
  packages: [],
};

export const maskEmail = (value?: string) => {
  if (!value) return "No email available";
  const [name, domain] = value.split("@");
  if (!name || !domain) return value;
  const visible = Math.max(1, Math.floor(name.length / 3));
  return `${name.slice(0, visible)}${"*".repeat(Math.max(1, name.length - visible))}@${domain}`;
};

export const maskPhone = (value?: string) => {
  if (!value) return "No mobile available";
  const clean = value.replace(/\s+/g, "");
  if (clean.length <= 4) return clean;
  return `${"*".repeat(Math.max(3, clean.length - 4))}${clean.slice(-4)}`;
};

export const formatDeliveryDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatAddress = (consignment?: AccessLinkConsignment) => {
  if (!consignment) return "N/A";
  return [
    consignment.receiver_address_1,
    consignment.receiver_address_2,
    consignment.receiver_suburb,
    consignment.receiver_city,
    consignment.receiver_state,
    consignment.receiver_country,
    consignment.receiver_postcode,
  ]
    .filter(Boolean)
    .join(", ");
};

export const decodeTokenPayload = (token: string): AccessLinkTokenPayload | null => {
  try {
    const parts = token.split(".");
    const payloadEncoded = parts.length === 2 ? parts[0] : parts.length === 3 ? parts[1] : "";
    if (!payloadEncoded) return null;

    const normalized = payloadEncoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as AccessLinkTokenPayload;
  } catch {
    return null;
  }
};

export const epochSecondsToIsoString = (epochSeconds?: number) => {
  if (!epochSeconds) return undefined;
  return new Date(epochSeconds * 1000).toISOString();
};

export const mapResponseToDashboardData = (
  responseData?: AccessLinkDetailsResponse["data"]
): DashboardShipmentData => {
  if (!responseData) return emptyDashboardShipmentData;

  return {
    estimatedDelivery: formatDeliveryDate(responseData.consignment?.delivery_date),
    receiver: responseData.consignment?.receiver_contact_name || "Customer",
    shippingNumber: responseData.shipmentId || "N/A",
    numberOfPackages: responseData.items?.length || 0,
    deliveryAddress: formatAddress(responseData.consignment),
    currentDeliveryOption:
      responseData.consignment?.preferred_delivery_option ||
      responseData.deliveryOptions?.[0]?.preferred_delivery_option ||
      "Not selected",
    managementDeadline: formatDateTime(responseData.deliveryOptionsUntil),
    shipmentType: "N/A",
    serviceType: responseData.consignment?.service_type || "N/A",
    serviceIndicator: "N/A",
    accountNumber: "N/A",
    receiverMobile: responseData.consignment?.receiver_mobile_number || "No mobile available",
    receiverEmail: responseData.consignment?.receiver_email || "No email available",
    senderName: responseData.consignment?.sender_contact_name || "N/A",
    senderMobile: responseData.consignment?.sender_mobile_number || "N/A",
    senderEmail: responseData.consignment?.sender_email || "N/A",
    preferredNotificationChannel:
      responseData.consignment?.preferred_notification_channel || "Not selected",
    packages: [],
  };
};

export const mapTokenPayloadToResponseData = (
  payload: AccessLinkTokenPayload
): AccessLinkDetailsResponse["data"] | undefined => {
  if (!payload.shipmentId) return undefined;

  return {
    shipmentId: payload.shipmentId,
    consignment: {
      receiver_contact_name: payload.consignment?.receiverName,
      receiver_mobile_number: payload.consignment?.receiverMobile,
      receiver_email: payload.consignment?.receiverEmail,
      delivery_date: payload.consignment?.deliveryDate,
      preferred_delivery_option: payload.consignment?.preferredDeliveryOption || undefined,
    },
    items: [],
    deliveryOptions: [],
    deliveryOptionsUntil: epochSecondsToIsoString(payload.accessMeta?.expiresAt),
  };
};

const formatPackageWeight = (weight?: number | null) => {
  if (!Number.isFinite(weight ?? NaN)) return "N/A";
  return `${weight} kg`;
};

const formatPackageDimensions = (
  length?: number | null,
  width?: number | null,
  height?: number | null
) => {
  const values = [length, width, height].map((value) => Number(value));
  if (values.some((value) => !Number.isFinite(value))) return "N/A";
  return `${values[0]} x ${values[1]} x ${values[2]}`;
};

export const mapShipmentDetailsToDashboardData = (
  details?: ShipmentCustomerDetailsResponse["data"]
): DashboardShipmentData => {
  if (!details) return emptyDashboardShipmentData;

  const address = details.receiver?.address;
  const deliveryAddress = [
    address?.addressLine1,
    address?.addressLine2,
    address?.suburb,
    address?.city,
    address?.state,
    address?.country,
    address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    estimatedDelivery: formatDeliveryDate(details.deliveryDate || undefined),
    receiver: details.receiver?.contactName || "Customer",
    shippingNumber: details.shipmentId || "N/A",
    numberOfPackages: details.packages?.length || 0,
    deliveryAddress: deliveryAddress || "N/A",
    currentDeliveryOption: details.preferredDeliveryOption || "Not selected",
    managementDeadline: formatDateTime(details.deliveryOptionsUntil || undefined),
    shipmentType: details.shipmentType || "N/A",
    serviceType: details.serviceType || "N/A",
    serviceIndicator: details.serviceIndicator || "N/A",
    accountNumber: details.receiver?.accountNumber || "N/A",
    receiverMobile: details.receiver?.mobileNumber || "No mobile available",
    receiverEmail: details.receiver?.emailAddress || "No email available",
    senderName: details.sender?.contactName || "N/A",
    senderMobile: details.sender?.mobileNumber || "N/A",
    senderEmail: details.sender?.emailAddress || "N/A",
    preferredNotificationChannel: details.preferredNotificationChannel || "Not selected",
    packages:
      details.packages?.map((pkg) => ({
        packageId: pkg.packageId,
        description: pkg.description || "N/A",
        weight: formatPackageWeight(pkg.weight),
        dimensions: formatPackageDimensions(pkg.length, pkg.width, pkg.height),
        isPrimary: pkg.isPrimary,
      })) || [],
  };
};
