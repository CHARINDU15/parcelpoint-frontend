"use client";

import { useEffect, useState } from "react";
import { submitDeliveryOption } from "@/lib/delivery-options";
import ModalFrame from "@/components/ModalFrame";

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

  return (
    <ModalFrame
      isOpen={isOpen}
      mounted={mounted}
      onClose={onClose}
      title="Leave with Trusted Person"
      subtitle="Authorize another person to receive the shipment on your behalf."
      maxWidthClass="max-w-lg"
      footer={
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-[#ff6b35] px-10 py-3.5 font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Trusted Person"}
        </button>
      }
    >
      <div className="space-y-5">
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
      </div>
    </ModalFrame>
  );
}
