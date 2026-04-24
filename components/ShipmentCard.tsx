"use client";

import { Copy, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ShipmentCardProps {
  estimatedDelivery: string;
  receiver: string;
  shippingNumber: string;
  numberOfPackages: number;
  deliveryAddress: string;
  currentDeliveryOption: string;
}

export default function ShipmentCard({
  estimatedDelivery,
  receiver,
  shippingNumber,
  numberOfPackages,
  deliveryAddress,
  currentDeliveryOption,
}: ShipmentCardProps) {
  const [copied, setCopied] = useState(false);

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
      {/* Grid layout: 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
        {/* Estimated Delivery */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#7a8798" }}>
            Estimated Delivery
          </p>
          <p className="text-lg font-bold" style={{ color: "#132235" }}>
            {estimatedDelivery}
          </p>
        </div>

        {/* Receiver */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#7a8798" }}>
            Receiver
          </p>
          <p className="text-lg font-bold" style={{ color: "#132235" }}>
            {receiver}
          </p>
        </div>

        {/* Shipping Number */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#7a8798" }}>
            Shipping Number
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: "#132235" }}>
              {shippingNumber}
            </p>
            <button
              onClick={handleCopy}
              className="p-1 rounded transition-all duration-200 hover:opacity-70"
              title="Copy shipping number"
            >
              <Copy size={14} style={{ color: copied ? "#0f766e" : "#7a8798" }} />
            </button>
          </div>
        </div>

        {/* Number of Packages */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#7a8798" }}>
            Number of Packages
          </p>
          <p className="text-sm font-semibold" style={{ color: "#132235" }}>
            {numberOfPackages}
          </p>
        </div>

        {/* Delivery Address */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#7a8798" }}>
            Delivery Address
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: "#132235" }}>
            {deliveryAddress}
          </p>
        </div>

        {/* Current Delivery Option */}
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "#7a8798" }}>
            Current Delivery Option
          </p>
          <p className="text-sm font-bold" style={{ color: "#c55a11" }}>
            {currentDeliveryOption}
          </p>
          <button
            className="text-xs mt-0.5 font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#c55a11" }}
          >
            See More
          </button>
        </div>
      </div>

      {/* Tracking Button */}
      <button
        className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
        style={{
          backgroundColor: "#132235",
          color: "#ffffff",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0b1726")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#132235")}
      >
        Tracking Info
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
