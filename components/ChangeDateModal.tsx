"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchAvailableDeliveryDates, submitDeliveryOption } from "@/lib/delivery-options";

interface ChangeDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  estimatedDelivery?: string;
  deliveryAddress?: string;
}

export default function ChangeDateModal({
  isOpen,
  onClose,
  onSuccess,
  estimatedDelivery = "N/A",
  deliveryAddress = "N/A",
}: ChangeDateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    setError("");
    setDeliveryDate("");
    setAdditionalInfo("");

    void (async () => {
      try {
        const dates = await fetchAvailableDeliveryDates();
        setAvailableDates(dates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load available dates");
      }
    })();

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async () => {
    if (!deliveryDate) {
      setError("Please select a new delivery date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await submitDeliveryOption({
        option: "CHANGE_DELIVERY_DATE",
        deliveryDate,
        additionalInfo,
      });

      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update delivery date");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-8 py-6">
          <h3 className="text-xl font-bold text-slate-900">Change Delivery Date</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>

        <div className="space-y-5 px-8 py-6">
          <div className="rounded-2xl bg-[#1e293b] p-5 text-white">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Estimated Delivery</p>
            <p className="mt-1 font-semibold">{estimatedDelivery}</p>
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">Delivery Address</p>
            <p className="mt-1 text-sm font-semibold">{deliveryAddress}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Select an available delivery date
            </label>
            <select
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-700 outline-none focus:border-orange-500"
            >
              <option value="">Choose a date</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
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

          <div className="rounded-xl bg-orange-50 px-4 py-3 text-xs text-orange-900">
            Only dates returned by `/api/delivery-options/available` are selectable here.
          </div>

          {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ff6b35] px-10 py-3.5 font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Delivery Date"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
