"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface ModalFrameProps {
  isOpen: boolean;
  mounted: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function ModalFrame({
  isOpen,
  mounted,
  onClose,
  title,
  subtitle,
  maxWidthClass = "max-w-xl",
  children,
  footer,
}: ModalFrameProps) {
  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative flex max-h-[92vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl`}
      >
        <div className="shrink-0 border-b px-5 py-4 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h3>
              {subtitle ? (
                <p className="mt-1 text-xs text-[#6b7b8d] sm:text-sm">{subtitle}</p>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close modal"
              type="button"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t bg-white px-5 py-4 sm:px-8">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
