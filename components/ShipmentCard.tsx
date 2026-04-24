"use client";

import { Copy, ChevronDown, ChevronUp, Clock3, MapPin, Package2, Route } from "lucide-react";
import { useEffect, useState } from "react";
import ModalFrame from "@/components/ModalFrame";

interface ShipmentCardProps {
  estimatedDelivery: string;
  receiver: string;
  shippingNumber: string;
  numberOfPackages: number;
  deliveryAddress: string;
  currentDeliveryOption: string;
  shipmentType?: string;
  serviceType?: string;
  senderName?: string;
  managementDeadline?: string;
  packages?: Array<{
    packageId: string;
    description: string;
    weight: string;
    dimensions: string;
    isPrimary: boolean;
  }>;
}

export default function ShipmentCard({
  estimatedDelivery,
  receiver,
  shippingNumber,
  numberOfPackages,
  deliveryAddress,
  currentDeliveryOption,
  shipmentType,
  serviceType,
  senderName,
  managementDeadline,
  packages = [],
}: ShipmentCardProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasDeliveryOption =
    currentDeliveryOption &&
    currentDeliveryOption !== "Not selected" &&
    currentDeliveryOption !== "N/A";

  const currentStatus = hasDeliveryOption ? "Preference confirmed" : "Waiting for delivery preference";
  const currentStatusDetail = hasDeliveryOption
    ? `Current instruction: ${currentDeliveryOption}`
    : "No delivery option has been confirmed yet. You can choose one below.";

  const trackingSteps = [
    {
      title: "Shipment registered",
      detail: `Shipment ${shippingNumber} is available in your dashboard.`,
      state: "done",
    },
    {
      title: "Receiver identified",
      detail: `${receiver} can manage this shipment securely.`,
      state: "done",
    },
    {
      title: hasDeliveryOption ? "Delivery preference selected" : "Delivery preference pending",
      detail: hasDeliveryOption
        ? currentDeliveryOption
        : "Choose the best delivery option before the management deadline.",
      state: hasDeliveryOption ? "done" : "current",
    },
    {
      title: "Estimated delivery",
      detail: estimatedDelivery !== "N/A" ? estimatedDelivery : "Delivery date not available yet.",
      state: hasDeliveryOption ? "current" : "upcoming",
    },
  ] as const;

  const handleCopy = () => {
    navigator.clipboard.writeText(shippingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 fade-in-up"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #d8e1ec",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium" style={{ color: "#7a8798" }}>
            Estimated Delivery
          </p>
          <p className="text-lg font-bold" style={{ color: "#132235" }}>
            {estimatedDelivery}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium" style={{ color: "#7a8798" }}>
            Receiver
          </p>
          <p className="text-lg font-bold" style={{ color: "#132235" }}>
            {receiver}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium" style={{ color: "#7a8798" }}>
            Shipping Number
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: "#132235" }}>
              {shippingNumber}
            </p>
            <button
              onClick={handleCopy}
              className="rounded p-1 transition-all duration-200 hover:opacity-70"
              title="Copy shipping number"
              type="button"
            >
              <Copy size={14} style={{ color: copied ? "#0f766e" : "#7a8798" }} />
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium" style={{ color: "#7a8798" }}>
            Number of Packages
          </p>
          <p className="text-sm font-semibold" style={{ color: "#132235" }}>
            {numberOfPackages}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium" style={{ color: "#7a8798" }}>
            Delivery Address
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: "#132235" }}>
            {deliveryAddress}
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium" style={{ color: "#7a8798" }}>
            Current Delivery Option
          </p>
          <p className="text-sm font-bold" style={{ color: "#c55a11" }}>
            {currentDeliveryOption}
          </p>
          <button
            className="mt-0.5 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: "#c55a11" }}
            type="button"
            onClick={() => setTrackingOpen(true)}
          >
            View tracking details
          </button>
        </div>
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: "#132235",
          color: "#ffffff",
        }}
        onClick={() => setTrackingOpen(true)}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0b1726")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#132235")}
      >
        Tracking Info
        {trackingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <ModalFrame
        isOpen={trackingOpen}
        mounted={mounted}
        onClose={() => setTrackingOpen(false)}
        title="Tracking Details"
        subtitle={`Shipment ${shippingNumber} overview and current delivery progress.`}
        maxWidthClass="max-w-5xl"
      >
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#d7e3ef] bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#132235] text-white">
                  <Route size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8798]">
                    Current Tracking Status
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#132235]">{currentStatus}</p>
                  <p className="mt-2 text-sm text-[#526277]">{currentStatusDetail}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e3ef] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8798]">
                Tracking Timeline
              </p>
              <div className="mt-4 space-y-4">
                {trackingSteps.map((step, index) => {
                  const isDone = step.state === "done";
                  const isCurrent = step.state === "current";

                  return (
                    <div key={step.title} className="flex items-start gap-3">
                      <div className="flex shrink-0 flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                            isDone
                              ? "border-[#0f766e] bg-[#0f766e] text-white"
                              : isCurrent
                              ? "border-[#c55a11] bg-[#fff1e7] text-[#c55a11]"
                              : "border-[#cfd9e4] bg-white text-[#8a98a8]"
                          }`}
                        >
                          {index + 1}
                        </div>
                        {index < trackingSteps.length - 1 ? (
                          <div className="mt-1 h-10 w-px bg-[#d8e1ec]" />
                        ) : null}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-[#132235]">{step.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#5a6a7f]">{step.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-[#d7e3ef] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#edf6ff] text-[#0f548c]">
                    <Clock3 size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8798]">
                      Management Deadline
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#132235]">
                      {managementDeadline || "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d7e3ef] bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fff1e7] text-[#c55a11]">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8798]">
                      Delivery Address
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#132235]">
                      {deliveryAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e3ef] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8798]">
                Shipment Snapshot
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f8fbff] p-3">
                  <p className="text-xs text-[#7a8798]">Sender</p>
                  <p className="mt-1 text-sm font-semibold break-words text-[#132235]">
                    {senderName || "Not available"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8fbff] p-3">
                  <p className="text-xs text-[#7a8798]">Shipment Type</p>
                  <p className="mt-1 text-sm font-semibold break-words text-[#132235]">
                    {shipmentType || "Not available"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8fbff] p-3">
                  <p className="text-xs text-[#7a8798]">Service Type</p>
                  <p className="mt-1 text-sm font-semibold break-words text-[#132235]">
                    {serviceType || "Not available"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8fbff] p-3">
                  <p className="text-xs text-[#7a8798]">Package Count</p>
                  <p className="mt-1 text-sm font-semibold text-[#132235]">{numberOfPackages}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e3ef] bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#132235] text-white">
                  <Package2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8798]">
                    Package Overview
                  </p>
                  <p className="mt-1 text-sm text-[#526277]">
                    {packages.length > 0
                      ? "Primary and supporting package details for this shipment."
                      : "Package-level tracking details are not available yet."}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {packages.length > 0 ? (
                  packages.slice(0, 3).map((pkg) => (
                    <div key={pkg.packageId} className="rounded-2xl bg-[#f8fbff] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="min-w-0 break-all text-sm font-semibold text-[#132235]">{pkg.packageId}</p>
                        {pkg.isPrimary ? (
                          <span className="rounded-full bg-[#132235] px-2.5 py-1 text-[11px] font-bold text-white">
                            Primary
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm break-words text-[#526277]">{pkg.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#6b7b8d]">
                        <span>{pkg.weight}</span>
                        <span>•</span>
                        <span>{pkg.dimensions}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d8e1ec] bg-[#fbfdff] p-4 text-sm text-[#6b7b8d]">
                    Package-level tracking updates will appear here when available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalFrame>
    </div>
  );
}
