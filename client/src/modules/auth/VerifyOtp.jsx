import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import summaryApi from "../../api/summaryApi";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Email comes from Forgot Password page
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚨 Prevent direct access
  if (!email) {
    toast.error("Invalid OTP verification flow");
    navigate("/forgot-password", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await Axios({
        ...summaryApi.verifyForgotOtp,
        data: {
          email,
          otp: otp.toString(),
        },
      });

      if (res.data.success) {
        toast.success("OTP verified successfully");

        // 👉 Go to reset password page
        navigate("/reset-password", {
          state: { email },
          replace: true,
        });
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A1C1E]">Verify OTP</h1>
          <p className="text-sm text-gray-600 mt-1">Enter the OTP sent to</p>
          <p className="text-sm font-semibold text-[#E65F41] break-all">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Input */}
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 text-center text-lg tracking-widest border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-[#E65F41]/30"
          />

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-[#E65F41] hover:bg-[#d65339] text-white py-2.5 rounded-xl font-semibold transition"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default VerifyOtp;
