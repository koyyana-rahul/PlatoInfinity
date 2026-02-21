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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 mb-4 sm:mb-6">
            <span className="text-2xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Verify OTP
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enter the code sent to your email
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 text-center">
            <p className="mb-1">OTP sent to:</p>
            <p className="font-semibold text-indigo-600 break-all">{email}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="block text-sm font-semibold text-gray-800"
              >
                One-Time Password
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white text-center text-2xl tracking-widest font-semibold"
              />
              <p className="text-xs text-gray-500 text-center">
                {6 - otp.length} digit{6 - otp.length !== 1 ? "s" : ""}{" "}
                remaining
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className={`w-full py-3 px-4 rounded-lg text-base font-semibold text-white transition-all duration-200 ${
                loading || otp.length !== 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-95 shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying...</span>
                </span>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          {/* Resend Option */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Resend OTP
              </button>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          The OTP will expire in 10 minutes
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
