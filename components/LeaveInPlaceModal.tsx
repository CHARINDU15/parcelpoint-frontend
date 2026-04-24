"use client";

import { useEffect, useState } from "react";
import { submitDeliveryOption } from "@/lib/delivery-options";
import ModalFrame from "@/components/ModalFrame";

interface LeaveInPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  deliveryAddress?: string;
}

const safeLocations = ["Front Door", "Back Door", "Reception", "Garage", "Security Desk"];

export default function LeaveInPlaceModal({
  isOpen,
  onClose,
  onSuccess,
  deliveryAddress = "N/A",
}: LeaveInPlaceModalProps) {
  const [mounted, setMounted] = useState(false);
  const [safeLocation, setSafeLocation] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setSafeLocation("");
    setAdditionalInfo("");
    setError("");

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!safeLocation) {
      setError("Please choose a safe location.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await submitDeliveryOption({
        option: "LEAVE_IN_SAFE_PLACE",
        safeLocation,
        additionalInfo,
      });
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save safe-place option");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame
      isOpen={isOpen}
      mounted={mounted}
      onClose={onClose}
      title="Leave in Place"
      subtitle="Choose a safe drop-off location for the delivery attempt."
      maxWidthClass="max-w-lg"
      footer={
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-[#ff6b35] px-10 py-3.5 font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Safe Place"}
        </button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-[#1e293b] p-5 text-white">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Delivery Address</p>
          <p className="mt-1 text-sm font-semibold">{deliveryAddress}</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">Safe location</label>
          <select
            value={safeLocation}
            onChange={(e) => setSafeLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700 outline-none focus:border-orange-500"
          >
            <option value="">Select location</option>
            {safeLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            maxLength={300}
            placeholder="Additional instructions"
            className="h-32 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm text-slate-700 outline-none focus:border-orange-500"
          />
          <span className="absolute bottom-3 right-4 text-xs text-slate-400">{additionalInfo.length}/300</span>
        </div>

        {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}
      </div>
    </ModalFrame>
  );
}
