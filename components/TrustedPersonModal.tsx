"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { submitDeliveryOption } from "@/lib/delivery-options";

interface TrustedPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export default function TrustedPersonModal({
  isOpen,
  onClose,
  onSuccess,
}: TrustedPersonModalProps) {
  const [mounted, setMounted] = useState(false);
  const [trustedPersonName, setTrustedPersonName] = useState("");
  const [trustedPersonMobile, setTrustedPersonMobile] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setTrustedPersonName("");
    setTrustedPersonMobile("");
    setAdditionalInfo("");
    setError("");

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async () => {
    if (!trustedPersonName || !trustedPersonMobile) {
      setError("Trusted person name and mobile number are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await submitDeliveryOption({
        option: "LEAVE_WITH_TRUSTED_PERSON",
        trustedPersonName,
        trustedPersonMobile,
        additionalInfo,
      });
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trusted person");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-8 py-6">
          <h3 className="text-xl font-bold text-slate-900">Leave with Trusted Person</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>

        <div className="space-y-5 px-8 py-6">
          <input className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="Trusted person name *" value={trustedPersonName} onChange={(e) => setTrustedPersonName(e.target.value)} />
          <input className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="Trusted person mobile *" value={trustedPersonMobile} onChange={(e) => setTrustedPersonMobile(e.target.value)} />

          <div className="relative">
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              maxLength={300}
              placeholder="Additional instructions"
              className="h-28 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-orange-500"
            />
            <span className="absolute bottom-3 right-4 text-xs text-slate-400">{additionalInfo.length}/300</span>
          </div>

          {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full bg-[#ff6b35] px-10 py-3.5 font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Trusted Person"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
