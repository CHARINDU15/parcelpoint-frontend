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
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);
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
    setSearchCenter(null);
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
    selectedLocation?.latitude != null && selectedLocation?.longitude != null
      ? `${selectedLocation.latitude},${selectedLocation.longitude}`
      : selectedLocation
      ? `${selectedLocation.name} ${selectedLocation.address || selectedLocation.location || ""}`
      : searchCenter
      ? `${searchCenter.lat},${searchCenter.lng}`
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
          setSearchCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
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
        setError("Location permission is requested only after you choose Use My Location.");
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
              Nearby locations load only after you explicitly choose Use My Location.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[1.1fr_0.9fr] sm:p-8">
          <div className="space-y-5">
            <div className="rounded-3xl border border-[#d8e3ee] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4fb_100%)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#132235]">Nearby ParcelPoint search</p>
                  <p className="mt-1 text-sm text-[#526277]">
                    Searching within <span className="font-bold text-[#0f548c]">{radiusKm} km</span>.
                    Switch the radius between 2 km and 10 km before loading locations.
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
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      radiusKm === value
                        ? "border-[#c55a11] bg-[#c55a11] text-white"
                        : "border-[#d8e1ec] bg-white text-[#526277]"
                    }`}
                  >
                    {value} km
                  </button>
                ))}
              </div>

              {searchCenter ? (
                <div className="mt-4 rounded-2xl border border-[#b7d5f0] bg-[#edf6ff] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0f548c]">My current location</p>
                      <p className="mt-1 text-xs text-[#4d6a85]">
                        Search center used to load nearby ParcelPoints within {radiusKm} km.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#0f548c] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                      You
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-[#4d6a85]">
                    {searchCenter.lat.toFixed(5)}, {searchCenter.lng.toFixed(5)}
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-sm font-semibold text-[#132235]">Nearby locations</p>
              <p className="mt-1 text-xs text-[#6b7b8d]">
                {locations.length > 0
                  ? `${locations.length} ParcelPoint${locations.length > 1 ? "s" : ""} found within ${radiusKm} km.`
                  : "Load nearby ParcelPoints to compare distance, address, and branch codes."}
              </p>
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#132235]">{location.name}</p>
                          {location.distance_km != null ? (
                            <span className="rounded-full bg-[#edf6ff] px-2.5 py-1 text-[11px] font-bold text-[#0f548c]">
                              {location.distance_km.toFixed(1)} km
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-[#526277]">
                          {location.address || location.location || "No address available"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#7a8798]">
                          <span>{location.branch_code || location.code || "Branch code unavailable"}</span>
                          <span>•</span>
                          <span>
                            {location.distance_km != null
                              ? `${location.distance_km.toFixed(1)} km away`
                              : "Distance unavailable"}
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#132235] px-2.5 py-1 text-[11px] font-bold text-white">
                        {location.code || location.branch_code || "PP"}
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
                  Preview updates for the selected ParcelPoint. Your current location is shown separately in blue above.
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#132235]">{selectedLocation.name}</p>
                  <span className="rounded-full bg-[#fff0e5] px-2.5 py-1 text-[11px] font-bold text-[#c55a11]">
                    Selected ParcelPoint
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#526277]">
                  {selectedLocation.address || selectedLocation.location || "No address available"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#6b7b8d]">
                  <span>Radius: {radiusKm} km</span>
                  <span>•</span>
                  <span>
                    Distance: {selectedLocation.distance_km != null ? `${selectedLocation.distance_km.toFixed(1)} km` : "Unavailable"}
                  </span>
                </div>
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
