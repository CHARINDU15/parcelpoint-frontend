"use client";
import { useState } from "react";
import LeaveInPlaceModal from "./LeaveInPlaceModal";
import CollectFromParcelPointModal from "./CollectFromParcelPointModal";
import HoldCollectionModal from "./HoldCollectionModel";
import TrustedPersonModal from "./TrustedPersonModal";

interface DeliveryOption {
  id: string;
  label: string;
  emoji: string;
}

const deliveryOptions: DeliveryOption[] = [
  { id: "parcelpoint", label: "Collect from ParcelPoint", emoji: "🏠" },
  { id: "change-date", label: "Change Delivery Date", emoji: "👍" },
  { id: "leave-place", label: "Leave in Place", emoji: "📦" },
  { id: "trusted-person", label: "Leave with Trusted Person", emoji: "🏡" },
  { id: "alternate", label: "Alternate Address", emoji: "😊" },
  { id: "hold", label: "Hold For Collection", emoji: "📦" },
];

interface DeliveryOptionsProps {
  managementDeadline?: string;
  onOptionSelect?: (optionId: string) => void;
}

export default function DeliveryOptions({
  managementDeadline = "[DD/MM/YYYY Time]",
  onOptionSelect,
}: DeliveryOptionsProps) {

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [isTrustedModalOpen, setIsTrustedModalOpen] = useState(false);

  return (
    <section>

      <h2 className="text-lg font-bold mb-1 text-slate-100">
        Manage Your Delivery Options
      </h2>

      <div className="flex items-center gap-2 mb-5">
        <div className="h-0.5 w-10 rounded-full bg-orange-500" />
        <p className="text-xs text-slate-400">
          You can manage your delivery preferences until{" "}
          <span className="text-slate-300">{managementDeadline}</span>
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {deliveryOptions.map((option) => (
          <DeliveryOptionButton
            key={option.id}
            option={option}
            onSelect={() => {

              if (option.id === "leave-place") {
                setIsLeaveModalOpen(true);
                return;
              }

              if (option.id === "parcelpoint") {
                setIsParcelModalOpen(true);
                return;
              }

              if (option.id === "hold") {
                setIsHoldModalOpen(true);
                return;
              }

              if (option.id === "trusted-person") {
                setIsTrustedModalOpen(true);
                return;
              }

              onOptionSelect?.(option.id);
            }}
          />
        ))}
      </div>

      {/* Modals */}
      <LeaveInPlaceModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />

      <CollectFromParcelPointModal
        isOpen={isParcelModalOpen}
        onClose={() => setIsParcelModalOpen(false)}
      />

      <HoldCollectionModal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
      />

      <TrustedPersonModal
        isOpen={isTrustedModalOpen}
        onClose={() => setIsTrustedModalOpen(false)}
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
      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-left transition-all duration-200"
      style={{
        backgroundColor: "#243044",
        color: "#cbd5e1",
        border: "1px solid #2c3a52",
      }}
    >
      <span>{option.label}</span>

      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center ml-2"
        style={{ backgroundColor: "#f97316" }}
      >
        {option.emoji}
      </span>
    </button>
  );
}
