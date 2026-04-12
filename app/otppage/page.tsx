"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function OTPPage() {
  const [step, setStep] = useState(1); // 1: Selection, 2: Input
  const [method, setMethod] = useState<"mobile" | "email">("mobile");
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneNumber = "*****6388";
  const emailAddress = "hiru****@gmail.com";

  // Countdown Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle OTP Input focus jumps
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleRequestOTP = () => {
    // Example: Trigger "Too many attempts" error
    // setError("Too many attempts. Please try again later.");
    // return;

    setError(null);
    setStep(2);
    setTimer(60);
  };

  const handleVerify = () => {
    const fullOtp = otp.join("");

    if (timer === 0) {
      setError("OTP has expired. Please request a new code.");
    } else if (fullOtp.length < 6) {
      setError("This code is no longer valid."); // Or "Please enter full code"
    } else {
      router.push("/");
    }
  };

  const handleResend = () => {
    setOtp(new Array(6).fill(""));
    setTimer(60);
    setError(null);
    // Trigger API call here
  };

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
          How would you like to receive your One Time Passcode?
        </p>

        {/* Method Toggle Buttons */}
        <div className="flex flex-row justify-center gap-4 mb-10">
          <button
            onClick={() => step === 1 && setMethod("mobile")}
            className={`px-10 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              method === "mobile"
                ? "bg-[#ff6b3d] border-[#ff6b3d]"
                : "bg-transparent border-white/20 hover:border-white/40"
            } ${step === 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Mobile
          </button>
          
          <button
            onClick={() => step === 1 && setMethod("email")}
            className={`px-10 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              method === "email"
                ? "bg-[#ff6b3d] border-[#ff6b3d]"
                : "bg-transparent border-white/20 hover:border-white/40"
            } ${step === 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            onClick={handleRequestOTP}
            className="bg-[#ff6b3d] hover:bg-[#b05638] px-10 py-3 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto mt-12 transition-all shadow-lg active:scale-95"
          >
            Request OTP <span className="text-2xl">›</span>
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
              className="text-slate-200 underline text-sm hover:text-white mb-8 transition-colors"
            >
              Send a New Passcode
            </button>

            <button
              onClick={handleVerify}
              className="bg-[#ff6b3d] hover:bg-[#b05638] px-14 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              Verify <span className="text-2xl">›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}