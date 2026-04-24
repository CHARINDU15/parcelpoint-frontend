"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { submitDeliveryOption } from "@/lib/delivery-options";

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

  if (!isOpen || !mounted) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-8 py-6">
          <h3 className="text-xl font-bold text-slate-900">Leave in Place</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>

        <div className="space-y-5 px-8 py-6">
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

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full bg-[#ff6b35] px-10 py-3.5 font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Safe Place"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
