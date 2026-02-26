import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldAlert, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import summaryApi from "../../api/summaryApi";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await Axios({
        ...summaryApi.forgotPassword,
        data: { email },
      });

      if (res.data.success) {
        toast.success("OTP sent to your email");

        // 👉 Move to OTP verification
        navigate("/verify-otp", {
          state: { email },
        });
      } else {
        toast.error(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#FC8019] to-[#FF6B35] mb-4 sm:mb-6 shadow-lg">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your email to receive an OTP
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 sm:p-8 space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-gray-700">
              <p>We'll send a one-time password (OTP) to your email address.</p>
            </div>

            {/* Send OTP Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 px-4 rounded-xl text-base font-semibold text-white transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-xl active:scale-[0.98] shadow-lg"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Sending OTP...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Send OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">
                Remember your password?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="w-full h-11 flex items-center justify-center rounded-xl text-base font-semibold text-[#FC8019] bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200"
          >
            Back to Login
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Check your spam folder if you don't receive the email
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
