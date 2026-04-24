"use client";

import { useEffect, useState } from "react";
import { submitDeliveryOption } from "@/lib/delivery-options";
import ModalFrame from "@/components/ModalFrame";

interface AlternateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  deliveryAddress?: string;
}

export default function AlternateAddressModal({
  isOpen,
  onClose,
  onSuccess,
  deliveryAddress = "N/A",
}: AlternateAddressModalProps) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    address1: "",
    address2: "",
    postcode: "",
    city: "",
    suburb: "",
    state: "",
    country: "LK",
    additionalInfo: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setForm({
      address1: "",
      address2: "",
      postcode: "",
      city: "",
      suburb: "",
      state: "",
      country: "LK",
      additionalInfo: "",
    });
    setError("");

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.address1 || !form.postcode || !form.city || !form.suburb || !form.state || !form.country) {
      setError("Please complete all required address fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await submitDeliveryOption({
        option: "ALTERNATE_ADDRESS",
        additionalInfo: form.additionalInfo,
        alternateAddress: {
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          suburb: form.suburb,
          state: form.state,
          country: form.country,
          postcode: form.postcode,
        },
      });
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save alternate address");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalFrame
      isOpen={isOpen}
      mounted={mounted}
      onClose={onClose}
      title="Alternate Address"
      subtitle="Update the destination address for this shipment before the deadline."
      maxWidthClass="max-w-2xl"
      footer={
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-full bg-[#ff6b35] px-10 py-3.5 font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Alternate Address"}
        </button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-[#1e293b] p-5 text-white">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Current Delivery Address</p>
          <p className="mt-1 text-sm font-semibold">{deliveryAddress}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="sm:col-span-2 rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="Address Line 01 *" value={form.address1} onChange={(e) => handleChange("address1", e.target.value)} />
          <input className="sm:col-span-2 rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="Address Line 02" value={form.address2} onChange={(e) => handleChange("address2", e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="Postal Code *" value={form.postcode} onChange={(e) => handleChange("postcode", e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="City *" value={form.city} onChange={(e) => handleChange("city", e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="Suburb *" value={form.suburb} onChange={(e) => handleChange("suburb", e.target.value)} />
          <input className="rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="State / Province *" value={form.state} onChange={(e) => handleChange("state", e.target.value)} />
          <input className="sm:col-span-2 rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500" placeholder="Country Code *" value={form.country} onChange={(e) => handleChange("country", e.target.value.toUpperCase())} />
        </div>

        <div className="relative">
          <textarea
            value={form.additionalInfo}
            onChange={(e) => handleChange("additionalInfo", e.target.value)}
            maxLength={300}
            placeholder="Additional instructions"
            className="h-28 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-orange-500"
          />
          <span className="absolute bottom-3 right-4 text-xs text-slate-400">{form.additionalInfo.length}/300</span>
        </div>

        {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}
      </div>
    </ModalFrame>
  );
}
