"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ChangeDateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeDateModal({ isOpen, onClose }: ChangeDateModalProps) {
  const [mounted, setMounted] = useState(false);
  // State for the new date input and text area
  const [collectionDate, setCollectionDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-8 pb-4">
          <h3 className="text-xl font-bold text-slate-900">Change Delivery Date</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="px-8 pb-8 space-y-6">
          {/* Status Card */}
          <div className="bg-[#1e293b] p-6 rounded-2xl space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                Estimated Delivery
              </p>
              <p className="font-bold text-sm text-white">
                Mon, 21 Feb 2024
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                Delivery Address
              </p>
              <p className="font-bold text-sm text-white leading-relaxed">
                37 Vishwa, Katukurunda, 800, Sri Lanka
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-base font-bold text-slate-800">
              Change the Date of Your Delivery
            </label>

            {/* Functional Date Input */}
            <div className="relative">
              <input
                type="date"
                value={collectionDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none bg-slate-50/50 text-slate-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-400"
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

            {/* Additional Info */}
            <div className="relative">
              <textarea
                placeholder="Enter Additional Information"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-4 text-sm h-32 resize-none outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-700 placeholder:text-slate-400 bg-slate-50/50"
                maxLength={300}
              />
              <span className="absolute bottom-4 right-4 text-[11px] font-medium text-slate-400">
                {additionalInfo.length}/300
              </span>
            </div>
          </div>

          {/* Business Days Notice */}
          <div className="flex gap-3 text-xs text-slate-500 leading-snug">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-slate-400">i</span>
            </div>
            <p>The new delivery date must be within 10 business days from the original date.</p>-
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button 
              onClick={onClose}
              className="w-full bg-[#ff6b35] hover:bg-[#e85a20] text-white font-bold py-3.5 px-10 rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-orange-200"
            >
              Done <span className="text-xl font-light">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}