"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ChangeDeliveryDateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeDeliveryDateModal({
  isOpen,
  onClose,
}: ChangeDeliveryDateModalProps) {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [collectionDate, setCollectionDate] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="
          relative bg-white w-full max-w-[620px]
          rounded-2xl shadow-2xl
          max-h-[95vh] flex flex-col
          animate-[fadeIn_.25s_ease-out]
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 sm:px-8 pt-6 sm:pt-8 pb-4 border-b">
          <h2 className="text-lg sm:text-[22px] font-bold text-gray-900">
            Change Delivery Date
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" d="M6 6L18 18M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-5 sm:px-8 py-6 space-y-6">

          {/* Collect From */}
          <div className="rounded-xl border border-[#233a5e] overflow-hidden">
            <div className="bg-[#233a5e] text-white px-5 sm:px-6 py-3 text-sm font-semibold">
              Collect From
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[480px] sm:min-w-full">
                <tbody>
                  {[
                    { label: "Branch Code", value: "SYD" },
                    { label: "Location", value: "Galle (Main Office)" },
                    { label: "Address", value: "Hapugala, Galle, Sri Lanka" },
                    { label: "Phone", value: "076 324 6388" },
                    {
                      label: "Hours",
                      value:
                        "Monday - Friday : 08:00 -18:00, Holidays: Closed",
                    },
                  ].map((row, i, arr) => (
                    <tr
                      key={row.label}
                      className={
                        i < arr.length - 1
                          ? "border-b border-[#d7e0ea]"
                          : ""
                      }
                    >
                      <td className="px-5 py-3 w-[40%] text-gray-500 border-r border-[#d7e0ea]">
                        {row.label}
                      </td>
                      <td className="px-5 py-3 text-gray-800">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Select the Collection Date
            </label>

            <div className="relative">
              <input
                type="date"
                value={collectionDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="relative">
            <textarea
              placeholder="Enter Additional Information"
              maxLength={300}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 h-[120px] text-sm resize-none outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <span className="absolute bottom-3 right-4 text-xs text-gray-400">
              {text.length}/300
            </span>
          </div>

          {/* Info */}
          <div className="flex gap-2 text-sm text-gray-500 items-start">
            <svg
              className="w-4 h-4 mt-0.5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-11a1 1 0 110-2 1 1 0 010 2zm-1 2h2v5H9V9z" />
            </svg>
            <p>
              We can hold your shipment for up to 10 business days from initial
              delivery date.
            </p>
          </div>
        </div>

        {/* Footer Button (Sticky on mobile) */}
        <div className="px-5 sm:px-8 py-4 border-t bg-white">
          <button
            onClick={onClose}
            className="
              w-full sm:w-auto
              bg-orange-500 hover:bg-orange-600 active:bg-orange-700
              text-white py-3 px-8
              rounded-full text-sm font-semibold
              shadow-md transition
            "
          >
            Done &gt;
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}