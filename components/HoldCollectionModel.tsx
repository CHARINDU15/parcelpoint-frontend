"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  fetchNearbyParcelPoints,
  submitDeliveryOption,
  type NearbyParcelPoint,
} from "@/lib/delivery-options";

interface HoldCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

export default function HoldCollectionModal({
  isOpen,
  onClose,
  onSuccess,
}: HoldCollectionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [collectionDate, setCollectionDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [locations, setLocations] = useState<NearbyParcelPoint[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setCollectionDate("");
    setAdditionalInfo("");
    setLocations([]);
    setSelectedLocationId("");
    setError("");

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const loadLocations = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setLoadingLocations(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const results = await fetchNearbyParcelPoints(
            position.coords.latitude,
            position.coords.longitude,
            10
          );
          setLocations(results);
          if (results[0]) {
            setSelectedLocationId(String(results[0].id));
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load nearby ParcelPoints");
        } finally {
          setLoadingLocations(false);
        }
      },
      () => {
        setLoadingLocations(false);
        setError("Location permission is needed to load nearby ParcelPoints.");
      }
    );
  };

  const handleSubmit = async () => {
    const selected = locations.find((location) => String(location.id) === selectedLocationId);
    if (!selected) {
      setError("Please load and select a ParcelPoint location.");
      return;
    }

    if (!collectionDate) {
      setError("Please choose a collection date.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await submitDeliveryOption({
        option: "HOLD_FOR_COLLECTION",
        additionalInfo,
        collectionDate,
        parcelPoint: {
          id: String(selected.id),
          name: selected.name,
          code: selected.code || undefined,
          branchCode: selected.branch_code || selected.code || undefined,
        },
      });
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save hold-for-collection option");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-8 py-6">
          <h3 className="text-xl font-bold text-slate-900">Hold For Collection</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>

        <div className="space-y-5 px-8 py-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Select a ParcelPoint collection location</p>
              <p className="text-xs text-slate-500">Nearby locations come from `/api/locations/upslocations/nearby`.</p>
            </div>
            <button
              onClick={loadLocations}
              disabled={loadingLocations}
              className="rounded-full bg-[#ff6b35] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {loadingLocations ? "Loading..." : "Use My Location"}
            </button>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-3">
            {locations.length > 0 ? (
              locations.map((location) => (
                <label
                  key={location.id}
                  className={`block cursor-pointer rounded-2xl border p-4 ${
                    selectedLocationId === String(location.id)
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="hold-location"
                    className="hidden"
                    checked={selectedLocationId === String(location.id)}
                    onChange={() => setSelectedLocationId(String(location.id))}
                  />
                  <p className="font-semibold text-slate-900">{location.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{location.address || location.location || "No address available"}</p>
                </label>
              ))
            ) : (
              <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">
                No locations loaded yet. Click `Use My Location` to fetch collection points.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">Collection date</label>
            <input
              type="date"
              value={collectionDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setCollectionDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div className="relative">
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              maxLength={300}
              placeholder="Additional instructions"
              className="h-28 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-orange-500"
            />
            <span className="absolute bottom-3 right-4 text-xs text-slate-400">{additionalInfo.length}/300</span>
          </div>

          {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full bg-[#ff6b35] px-10 py-3.5 font-bold text-white transition hover:bg-[#e85a20] disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Hold For Collection"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
