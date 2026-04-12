"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OTPPage() {
  const [step, setStep] = useState(1); // 1: Selection, 2: Input
  const [method, setMethod] = useState<"mobile" | "email">("mobile");
  const [timer, setTimer] = useState(60);
  const router = useRouter();

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

  const handleRequestOTP = () => {
    setStep(2);
    setTimer(60);
  };

  const handleVerify = () => {
    // Navigate to the Dashboard after successful "verification"
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ffffff] p-4 font-sans">
      <div className="w-full max-w-2xl bg-[#1e293b] rounded-2xl p-10 py-16 shadow-2xl text-center text-white">
        
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
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
            } ${step === 2 ? 'cursor-default' : ''}`}
          >
            Mobile
          </button>
          
          <button
            onClick={() => step === 1 && setMethod("email")}
            className={`px-10 py-3 rounded-xl font-bold text-lg transition-all border-2 ${
              method === "email"
                ? "bg-[#ff6b3d] border-[#ff6b3d]"
                : "bg-transparent border-white/20 hover:border-white/40"
            } ${step === 2 ? 'cursor-default' : ''}`}
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
          /* STEP 1: INITIAL REQUEST VIEW */
          <button
            onClick={handleRequestOTP}
            className="bg-[#ff6b3d] hover:bg-[#b05638] px-10 py-3 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto mt-12 transition-all shadow-lg"
          >
            Request OTP <span className="text-2xl">›</span>
          </button>
        ) : (
          /* STEP 2: OTP INPUT VIEW */
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <p className="text-slate-300 mb-6">
              We have sent the One Time Passcode to your {method === "mobile" ? "Mobile" : "Email"}.
            </p>
            
            <div className="flex gap-2 mb-4">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 bg-white rounded-lg text-black text-2xl font-bold text-center outline-none focus:ring-4 focus:ring-[#ff6b3d]/50"
                />
              ))}
            </div>

            <p className="text-slate-400 text-sm mb-2">
              {timer > 0 ? `${timer} second left...` : "Time expired"}
            </p>

            <button 
              onClick={() => setTimer(60)}
              className="text-slate-200 underline text-sm hover:text-white mb-8"
            >
              Send a New Passcode
            </button>

            <button
              onClick={handleVerify}
              className="bg-[#c26241] hover:bg-[#b05638] px-14 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg"
            >
              Verify <span className="text-2xl">›</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}