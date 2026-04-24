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
