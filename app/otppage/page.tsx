"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  decodeTokenPayload,
  formatDateTime,
  mapResponseToDashboardData,
  mapTokenPayloadToResponseData,
  maskEmail,
  maskPhone,
} from "@/lib/access-link";

const ORCHESTRATION_API_BASE =
  process.env.NEXT_PUBLIC_ORCHESTRATION_API_URL || "http://localhost:3002";

function OTPPageContent() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"mobile" | "email">("mobile");
  const [timer, setTimer] = useState(120);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [receiverName, setReceiverName] = useState("Customer");
  const [deliveryDate, setDeliveryDate] = useState("N/A");
  const [preferredDeliveryOption, setPreferredDeliveryOption] = useState("Not selected");
  const [accessExpiry, setAccessExpiry] = useState("N/A");
  const [phoneNumber, setPhoneNumber] = useState("No mobile available");
  const [emailAddress, setEmailAddress] = useState("No email available");

  const router = useRouter();
  const searchParams = useSearchParams();

  const canRequestOtp = useMemo(() => {
    if (!shipmentId || !accessToken) return false;
    if (method === "mobile") return !!receiverMobile;
    return !!receiverEmail;
  }, [shipmentId, accessToken, method, receiverMobile, receiverEmail]);

  const hasMobileChannel = !!receiverMobile;
  const hasEmailChannel = !!receiverEmail;

  const persistDashboardData = useCallback((responseData?: ReturnType<typeof mapTokenPayloadToResponseData>) => {
    if (!responseData) return;

    sessionStorage.setItem(
      "parcelpoint_shipment_data",
      JSON.stringify(mapResponseToDashboardData(responseData))
    );
  }, []);

  const requestOtp = async () => {
    if (!canRequestOtp || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${ORCHESTRATION_API_BASE}/api/otp/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          shipmentId,
          channel: method === "mobile" ? "SMS" : "EMAIL",
          destination: method === "mobile" ? receiverMobile : receiverEmail,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to request OTP");
      }

      const expiresAt = payload?.data?.expiresAt;
      const secondsRemaining = expiresAt
        ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
        : 120;

      setStep(2);
      setOtp(new Array(6).fill(""));
      setTimer(secondsRemaining || 120);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    const fullOtp = otp.join("");

    if (timer === 0) {
      setError("OTP has expired. Please request a new code.");
      return;
    }

    if (fullOtp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${ORCHESTRATION_API_BASE}/api/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ shipmentId, otp: fullOtp }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "OTP verification failed");
      }

      sessionStorage.setItem("parcelpoint_access_token", accessToken);
      sessionStorage.setItem("parcelpoint_link_token", accessToken);
      sessionStorage.setItem("parcelpoint_shipment_id", shipmentId);
      sessionStorage.setItem("parcelpoint_otp_verified", "true");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const token = (searchParams.get("token") || "").trim();
    if (!token) {
      setError("Missing access token in URL.");
      setLoading(false);
      return;
    }

    setAccessToken(token);
    sessionStorage.setItem("parcelpoint_link_token", token);

    // Try to decode embedded payload and use it if available to avoid an extra API call
    const payload = decodeTokenPayload(token);
    if (payload?.exp && payload.exp * 1000 <= Date.now()) {
      setError("Access link has expired.");
      setLoading(false);
      return;
    }

    if (payload && typeof payload.shipmentId === "string") {
      setShipmentId(payload.shipmentId);
      sessionStorage.setItem("parcelpoint_shipment_id", payload.shipmentId);

      if (payload.consignment) {
        const c = payload.consignment;
        setReceiverMobile(c.receiverMobile || "");
        setReceiverEmail(c.receiverEmail || "");
        setReceiverName(c.receiverName || "Customer");
        setDeliveryDate(c.deliveryDate ? formatDateTime(c.deliveryDate) : "N/A");
        setPreferredDeliveryOption(c.preferredDeliveryOption || "Not selected");
        setAccessExpiry(formatDateTime(payload.accessMeta?.expiresAt ? new Date(payload.accessMeta.expiresAt * 1000).toISOString() : undefined));
        setPhoneNumber(maskPhone(c.receiverMobile));
        setEmailAddress(maskEmail(c.receiverEmail));
        if (!c.receiverMobile) setMethod("email");

        persistDashboardData(mapTokenPayloadToResponseData(payload));

        setLoading(false);
        return;
      }
    }

    setError("Invalid access token payload.");
    setLoading(false);
  }, [searchParams, persistDashboardData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleResend = () => {
    setOtp(new Array(6).fill(""));
    setError(null);
    requestOtp();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ffffff] p-4 font-sans">
        <div className="w-full max-w-2xl bg-[#1e293b] rounded-2xl p-10 py-16 shadow-2xl text-center text-white">
          Loading shipment details...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ffffff] p-4 font-sans">
      <div className="relative w-full max-w-2xl bg-[#1e293b] rounded-2xl p-10 py-16 shadow-2xl text-center text-white overflow-hidden">
        
        {/* DYNAMIC ERROR MESSAGE BLOCK */}
        {error && (
          <div className="absolute top-4 left-4 right-4 animate-in fade-in slide-in-from-top-2 duration-300 z-10">
            <div className="bg-[#ff5f5f] text-white px-5 py-3 rounded-xl flex justify-between items-center shadow-lg border border-white/10">
              <span className="font-medium text-sm md:text-base">
                Error ! {error}
              </span>
              <button 
                onClick={() => setError(null)}
                className="text-white hover:text-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <h1 className="text-4xl font-extrabold mb-4 tracking-tight mt-4">
          Verify Your Identity!
        </h1>

        <p className="text-slate-300 text-lg mb-10 font-medium">
          How would you like to receive your One Time Passcode for {shipmentId || "your shipment"}?
        </p>

        <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Receiver</p>
            <p className="mt-1 text-base font-semibold text-white">{receiverName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Delivery date</p>
            <p className="mt-1 text-base font-semibold text-white">{deliveryDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Preferred option</p>
            <p className="mt-1 text-base font-semibold text-white">{preferredDeliveryOption}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Link expires</p>
            <p className="mt-1 text-base font-semibold text-white">{accessExpiry}</p>
          </div>
        </div>

        {/* Method Toggle Buttons */}
        <div className="flex flex-row justify-center gap-4 mb-10">
          <button
            onClick={() => step === 1 && hasMobileChannel && setMethod("mobile")}
            disabled={!hasMobileChannel}
            className={`px-10 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              method === "mobile"
                ? "bg-[#ff6b3d] border-[#ff6b3d]"
                : "bg-transparent border-white/20 hover:border-white/40"
            } ${step === 2 || !hasMobileChannel ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Mobile
          </button>
          
          <button
            onClick={() => step === 1 && hasEmailChannel && setMethod("email")}
            disabled={!hasEmailChannel}
            className={`px-10 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              method === "email"
                ? "bg-[#ff6b3d] border-[#ff6b3d]"
                : "bg-transparent border-white/20 hover:border-white/40"
            } ${step === 2 || !hasEmailChannel ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Email
          </button>
        </div>

        {/* Dynamic Target Info */}
        <p className="text-slate-200 text-lg mb-4">
          Send the One Time Passcode to{" "}
          <span className="font-semibold">
            {method === "mobile" ? phoneNumber : emailAddress}
          </span>
        </p>

        {step === 1 ? (
          <button
            onClick={requestOtp}
            disabled={!canRequestOtp || submitting}
            className="bg-[#ff6b3d] hover:bg-[#b05638] disabled:opacity-50 disabled:cursor-not-allowed px-10 py-3 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto mt-12 transition-all shadow-lg active:scale-95"
          >
            {submitting ? "Requesting..." : "Request OTP"} <span className="text-2xl">›</span>
          </button>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <p className="text-slate-300 mb-6">
              We have sent the One Time Passcode to your {method === "mobile" ? "Mobile" : "Email"}.
            </p>
            
            <div className="flex gap-2 mb-4">
              {otp.map((data, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleChange(e.target, i)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 bg-white rounded-lg text-black text-2xl font-bold text-center outline-none focus:ring-4 focus:ring-[#ff6b3d]/50 transition-all"
                />
              ))}
            </div>

            <p className="text-slate-400 text-sm mb-2">
              {timer > 0 ? `${timer} seconds left...` : "Time expired"}
            </p>

            <button 
              onClick={handleResend}
              disabled={submitting}
              className="text-slate-200 underline text-sm hover:text-white mb-8 transition-colors disabled:opacity-50"
            >
              Send a New Passcode
            </button>

            <button
              onClick={verifyOtp}
              disabled={submitting}
              className="bg-[#ff6b3d] hover:bg-[#b05638] disabled:opacity-50 disabled:cursor-not-allowed px-14 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              {submitting ? "Verifying..." : "Verify"} <span className="text-2xl">›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#ffffff] p-4 font-sans">
          <div className="w-full max-w-2xl bg-[#1e293b] rounded-2xl p-10 py-16 shadow-2xl text-center text-white">
            Loading shipment details...
          </div>
        </div>
      }
    >
      <OTPPageContent />
    </Suspense>
  );
}
