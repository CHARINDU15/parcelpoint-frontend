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
        backgroundColor: "rgba(248, 251, 255, 0.92)",
        borderBottom: "1px solid #d8e1ec",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#132235] text-xs font-black tracking-[0.2em] text-white">
            PP
          </div>
          <span
            className="text-lg font-bold tracking-wide"
            style={{ color: "#132235", letterSpacing: "0.06em" }}
          >
            Parcel <span style={{ color: "#c55a11" }}>Point</span>
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: "#526277" }}
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
