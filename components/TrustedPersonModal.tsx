"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TrustedPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrustedPersonModal({
  isOpen,
  onClose,
}: TrustedPersonModalProps) {
  const [mounted, setMounted] = useState(false);
  const [textLength, setTextLength] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#2f3b4a]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto bg-[#f6f6f6] rounded-[22px] shadow-2xl p-6 sm:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg sm:text-[20px] font-semibold text-[#111827]">
            Leave with Trusted Person
          </h2>

          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-black text-[22px]"
          >
            ×
          </button>
        </div>

        {/* Dropdown */}
        <div className="mb-6">
          <label className="label">
            Trusted Person <span className="required">*</span>
          </label>
          <select className="inputStyle w-full text-[#9ca3af] ">
            <option value="">Select Type</option>
            <option>Family</option>
            <option>Friend</option>
            <option>Neighbor</option>
          </select>
        </div>

        {/* Section Title */}
        <h3 className="text-[15px] font-semibold text-[#111827] mb-4">
          Trusted Person Details
        </h3>

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Name</label>
            <input type="text" className="inputStyle w-full text-[#9ca3af]" />
          </div>

          <div>
            <label className="label">
              Phone Number <span className="required">*</span>
            </label>
            <input type="text" className="inputStyle w-full text-[#9ca3af]" />
          </div>
        </div>

        {/* Address 1 */}
        <div className="mb-4">
          <label className="label">
            Address Line 01 <span className="required">*</span>
          </label>
          <input type="text" className="inputStyle w-full text-[#9ca3af]" />
        </div>

        {/* Address 2 */}
        <div className="mb-4">
          <label className="label">Address Line 02</label>
          <input type="text" className="inputStyle w-full text-[#9ca3af]" />
        </div>

        {/* Postal + City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">
              Postal Code <span className="required">*</span>
            </label>
            <input type="text" className="inputStyle w-full text-[#9ca3af]" />
          </div>

          <div>
            <label className="label">
              City <span className="required">*</span>
            </label>
            <input type="text" className="inputStyle w-full text-[#9ca3af]" />
          </div>
        </div>

        {/* District */}
        <div className="mb-4">
          <label className="label">
            District <span className="required">*</span>
          </label>
          <input type="text" className="inputStyle w-full text-[#9ca3af]" />
        </div>

        {/* Additional Info */}
        <div className="relative mb-6">
          <label className="label">Additional Information</label>
          <textarea
            maxLength={300}
            onChange={(e) => setTextLength(e.target.value.length)}
            className="w-full h-[110px] p-4 rounded-[12px] border border-[#d6d6d6] bg-[#f9f9f9] text-[14px] resize-none outline-none focus:border-[#ff6b35] text-[#9ca3af]"
          />
          <span className="absolute bottom-3 right-4 text-[12px] text-[#9ca3af]">
            {textLength}/300
          </span>
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            className="w-[18px] h-[18px] accent-[#ff6b35] cursor-pointer"
          />
          <span className="text-[14px] text-[#374151]">
            Change Estimated Delivery Date
          </span>
        </div>

        {/* Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#ff6b35] hover:bg-[#e85a20] transition text-white text-[15px] font-semibold px-8 py-3 rounded-full shadow-md"
          >
            Done
          </button>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .inputStyle {
          height: 46px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid #d6d6d6;
          background: #f9f9f9;
          font-size: 14px;
          outline: none;
        }
        .inputStyle:focus {
          border-color: #ff6b35;
        }
        .label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .required {
          color: #ef4444;
        }
      `}</style>
    </div>,
    document.body
  );
}