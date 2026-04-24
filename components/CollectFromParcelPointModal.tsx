"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  fetchNearbyParcelPoints,
  submitDeliveryOption,
  type NearbyParcelPoint,
} from "@/lib/delivery-options";

interface CollectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
}

const radiusOptions = [2, 4, 6, 8, 10];

export default function CollectFromParcelPointModal({
  isOpen,
  onClose,
  onSuccess,
}: CollectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [radiusKm, setRadiusKm] = useState(4);
  const [locations, setLocations] = useState<NearbyParcelPoint[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setRadiusKm(4);
    setLocations([]);
    setSelectedLocationId("");
    setAdditionalInfo("");
    setError("");

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const selectedLocation = useMemo(
    () => locations.find((location) => String(location.id) === selectedLocationId),
    [locations, selectedLocationId]
  );

  const mapQuery = encodeURIComponent(
    selectedLocation
      ? `${selectedLocation.name} ${selectedLocation.address || selectedLocation.location || ""}`
      : "Sri Lanka ParcelPoint"
  );

  if (!isOpen || !mounted) return null;

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
            radiusKm
          );
          setLocations(results);
          setSelectedLocationId(results[0] ? String(results[0].id) : "");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load nearby ParcelPoints");
        } finally {
          setLoadingLocations(false);
        }
      },
      () => {
        setLoadingLocations(false);
        setError("Location permission is needed only when you choose `Use My Location`.");
      }
    );
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      setError("Please load and select a ParcelPoint location.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await submitDeliveryOption({
        option: "COLLECT_FROM_PARCELPOINT",
        additionalInfo,
        parcelPoint: {
          id: String(selectedLocation.id),
          name: selectedLocation.name,
          code: selectedLocation.code || undefined,
          branchCode: selectedLocation.branch_code || selectedLocation.code || undefined,
        },
      });
      await onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save ParcelPoint collection");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 sm:px-8 sm:py-6">
          <div>
            <h3 className="text-lg font-bold text-[#132235] sm:text-xl">Collect From ParcelPoint</h3>
            <p className="mt-1 text-xs text-[#6b7b8d]">
              Nearby locations are loaded only after you explicitly allow location access.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[1.1fr_0.9fr] sm:p-8">
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fbff] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#132235]">Nearby ParcelPoint search</p>
                  <p className="mt-1 text-xs text-[#6b7b8d]">
                    Radius can be changed from 2 km up to 10 km before loading locations.
                  </p>
                </div>
                <button
                  onClick={loadLocations}
                  disabled={loadingLocations}
                  className="rounded-full bg-[#132235] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {loadingLocations ? "Loading..." : "Use My Location"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {radiusOptions.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRadiusKm(value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      radiusKm === value
                        ? "bg-[#c55a11] text-white"
                        : "bg-white text-[#526277] border border-[#d8e1ec]"
                    }`}
                  >
                    {value} km
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {locations.length > 0 ? (
                locations.map((location) => (
                  <label
                    key={location.id}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedLocationId === String(location.id)
                        ? "border-[#c55a11] bg-[#fff5ec]"
                        : "border-[#e2e8f0] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="parcelpoint"
                      className="hidden"
                      checked={selectedLocationId === String(location.id)}
                      onChange={() => setSelectedLocationId(String(location.id))}
                    />
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#132235]">{location.name}</p>
                        <p className="mt-1 text-sm text-[#526277]">
                          {location.address || location.location || "No address available"}
                        </p>
                        <p className="mt-2 text-xs text-[#7a8798]">
                          {location.distance_km ? `${location.distance_km.toFixed(1)} km away` : "Distance unavailable"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#132235] px-2.5 py-1 text-[11px] font-bold text-white">
                        {location.code || "PP"}
                      </span>
                    </div>
                  </label>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8e1ec] bg-white p-4 text-sm text-[#6b7b8d]">
                  No nearby ParcelPoints loaded yet.
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                maxLength={300}
                placeholder="Additional instructions"
                className="h-28 w-full resize-none rounded-2xl border border-[#d8e1ec] p-4 text-sm text-[#132235] outline-none focus:border-[#c55a11]"
              />
              <span className="absolute bottom-3 right-4 text-xs text-[#7a8798]">{additionalInfo.length}/300</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[#d8e1ec] bg-white">
              <div className="border-b border-[#e2e8f0] px-4 py-3">
                <p className="text-sm font-semibold text-[#132235]">Google Maps Preview</p>
                <p className="mt-1 text-xs text-[#6b7b8d]">
                  Preview updates when you select a ParcelPoint.
                </p>
              </div>
              <iframe
                title="ParcelPoint map preview"
                src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
                className="h-[260px] w-full border-0 sm:h-[340px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {selectedLocation ? (
              <div className="rounded-2xl border border-[#d8e1ec] bg-[#f8fbff] p-4">
                <p className="text-sm font-semibold text-[#132235]">{selectedLocation.name}</p>
                <p className="mt-1 text-sm text-[#526277]">
                  {selectedLocation.address || selectedLocation.location || "No address available"}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-semibold text-[#c55a11]"
                >
                  Open in Google Maps
                </a>
              </div>
            ) : null}

            {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-full bg-[#132235] px-10 py-3.5 font-bold text-white transition hover:bg-[#0b1726] disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save ParcelPoint Collection"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
