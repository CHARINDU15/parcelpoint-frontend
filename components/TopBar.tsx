"use client";

import { LogOut } from "lucide-react";

interface TopBarProps {
  onLogout?: () => void;
}

export default function TopBar({ onLogout }: TopBarProps) {
  return (
    <header
      className="w-full sticky top-0 z-50"
      style={{
        backgroundColor: "rgba(248, 251, 255, 0.82)",
        borderBottom: "1px solid rgba(216, 225, 236, 0.9)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#132235_0%,#21486f_100%)] text-xs font-black tracking-[0.2em] text-white shadow-[0_12px_28px_rgba(19,34,53,0.28)]">
            PP
          </div>
          <div>
            <span
              className="text-lg font-bold tracking-wide"
              style={{ color: "#132235", letterSpacing: "0.06em" }}
            >
              Parcel <span style={{ color: "#c55a11" }}>Point</span>
            </span>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#7a8798]">
              Customer Delivery Hub
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-full border border-[#d8e1ec] bg-white/90 px-4 py-2 text-sm font-medium text-[#526277] shadow-sm transition-all duration-200 hover:border-[#c9d7e6] hover:bg-white hover:text-[#132235]"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
