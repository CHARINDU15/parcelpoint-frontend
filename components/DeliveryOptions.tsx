"use client";

import { useState } from "react";
import LeaveInPlaceModal from "./LeaveInPlaceModal";
import CollectFromParcelPointModal from "./CollectFromParcelPointModal";
import HoldCollectionModal from "./HoldCollectionModel";
import TrustedPersonModal from "./TrustedPersonModal";
import AlternateAddressModal from "./AlternateAddressModal";
import ChangeDateModal from "./ChangeDateModal";

interface DeliveryOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: "parcelpoint",
    label: "Collect from ParcelPoint",
    icon: "PP",
    description: "Pick up from a nearby ParcelPoint location.",
  },
  {
    id: "change-date",
    label: "Change Delivery Date",
    icon: "CD",
    description: "Choose another available delivery date.",
  },
  {
    id: "leave-place",
    label: "Leave in Place",
    icon: "LP",
    description: "Tell the driver where to leave the shipment safely.",
  },
  {
    id: "trusted-person",
    label: "Leave with Trusted Person",
    icon: "TP",
    description: "Authorize a trusted person to receive the package.",
  },
  {
    id: "alternate",
    label: "Alternate Address",
    icon: "AA",
    description: "Redirect the shipment to another delivery address.",
  },
  {
    id: "hold",
    label: "Hold For Collection",
    icon: "HC",
    description: "Hold the shipment for pickup on a selected date.",
  },
];

interface DeliveryOptionsProps {
  managementDeadline?: string;
  estimatedDelivery?: string;
  deliveryAddress?: string;
  onUpdated?: () => void | Promise<void>;
}

export default function DeliveryOptions({
  managementDeadline = "[DD/MM/YYYY Time]",
  estimatedDelivery = "N/A",
  deliveryAddress = "N/A",
  onUpdated,
}: DeliveryOptionsProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isTrustedModalOpen, setIsTrustedModalOpen] = useState(false);
  const [isAlternateModalOpen, setIsAlternateModalOpen] = useState(false);
  const [isChangeDateModalOpen, setIsChangeDateModalOpen] = useState(false);

  return (
    <section className="rounded-3xl border border-[#374151] bg-gradient-to-br from-[#182233] to-[#243044] p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Manage Your Delivery Options</h2>
          <p className="mt-2 text-sm text-slate-400">
            Update the shipment using any of the 6 supported delivery actions below.
          </p>
        </div>

        <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 shadow-[0_0_0_1px_rgba(251,146,60,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-300">
            Cutoff Deadline
          </p>
          <p className="mt-1 text-lg font-extrabold text-orange-200">{managementDeadline}</p>
          <p className="mt-1 text-xs text-orange-100/80">
            Changes after this time may be rejected by the orchestration service.
          </p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-[#111827]/40 p-4 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Estimated Delivery
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{estimatedDelivery}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Delivery Address
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-100">{deliveryAddress}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {deliveryOptions.map((option) => (
          <DeliveryOptionButton
            key={option.id}
            option={option}
            onSelect={() => {
              if (option.id === "leave-place") setIsLeaveModalOpen(true);
              if (option.id === "parcelpoint") setIsParcelModalOpen(true);
              if (option.id === "hold") setIsHoldModalOpen(true);
              if (option.id === "trusted-person") setIsTrustedModalOpen(true);
              if (option.id === "alternate") setIsAlternateModalOpen(true);
              if (option.id === "change-date") setIsChangeDateModalOpen(true);
            }}
          />
        ))}
      </div>

      <LeaveInPlaceModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSuccess={onUpdated}
        deliveryAddress={deliveryAddress}
      />

      <CollectFromParcelPointModal
        isOpen={isParcelModalOpen}
        onClose={() => setIsParcelModalOpen(false)}
        onSuccess={onUpdated}
      />

      <HoldCollectionModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        onSuccess={onUpdated}
      />

      <TrustedPersonModal
        isOpen={isTrustedModalOpen}
        onClose={() => setIsTrustedModalOpen(false)}
        onSuccess={onUpdated}
      />

      <AlternateAddressModal
        isOpen={isAlternateModalOpen}
        onClose={() => setIsAlternateModalOpen(false)}
        onSuccess={onUpdated}
        deliveryAddress={deliveryAddress}
      />

      <ChangeDateModal
        isOpen={isChangeDateModalOpen}
        onClose={() => setIsChangeDateModalOpen(false)}
        onSuccess={onUpdated}
        estimatedDelivery={estimatedDelivery}
        deliveryAddress={deliveryAddress}
      />
    </section>
  );
}

function DeliveryOptionButton({
  option,
  onSelect,
}: {
  option: DeliveryOption;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="group rounded-2xl border border-[#334155] bg-[#243044] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-[#2b3a52]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-100">{option.label}</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">{option.description}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-bold text-white">
          {option.icon}
        </span>
      </div>
    </button>
  );
}
