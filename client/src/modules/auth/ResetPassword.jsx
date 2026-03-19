import React, { useState } from "react";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { notify } from "../../utils/notify";

import Axios from "../../api/axios";
import summaryApi from "../../api/summaryApi";
import AuthLogo from "./components/AuthLogo";
import {
  validatePassword,
  passwordRequirementsText,
} from "../../utils/validation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Email comes from OTP verification page
  const email = location.state?.email;

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🚨 Prevent direct access
  if (!email) {
    notify.error("Invalid password reset flow");
    navigate("/forgot-password", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = form;

    if (!newPassword || !confirmPassword) {
      notify.error("All fields are required");
      return;
    }

    if (!validatePassword(newPassword)) {
      notify.error(passwordRequirementsText);
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await Axios({
        ...summaryApi.resetPassword,
        data: {
          email,
          newPassword,
          confirmPassword,
        },
      });

      if (res.data.success) {
        notify.success("Password reset successful");
        navigate("/login", { replace: true });
      } else {
        notify.error(res.data.message || "Reset failed");
      }
    } catch (err) {
      notify.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-8">
        <div className="text-center">
          <AuthLogo className="mb-4 sm:mb-6" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create a new password for your account
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 sm:p-8 space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Display (Read-only) */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                disabled
                className="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-gray-800"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  value={form.newPassword}
                  onChange={handleChange}
                  className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#FC8019] transition-colors"
                >
                  {showPwd ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {passwordRequirementsText}
              </p>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-800"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPwd ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#FC8019] transition-colors"
                >
                  {showConfirmPwd ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {form.newPassword && form.confirmPassword && (
              <div
                className={`text-sm px-3 py-2 rounded-xl flex items-center space-x-2 ${
                  form.newPassword === form.confirmPassword
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {form.newPassword === form.confirmPassword ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Passwords match</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg leading-none">✗</span>
                    <span>Passwords don't match</span>
                  </>
                )}
              </div>
            )}

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={
                loading ||
                form.newPassword !== form.confirmPassword ||
                !form.newPassword
              }
              className={`w-full h-11 px-4 rounded-xl text-base font-semibold text-white transition-all duration-200 ${
                loading ||
                form.newPassword !== form.confirmPassword ||
                !form.newPassword
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-xl active:scale-[0.98] shadow-lg"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Resetting password...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Reset Password</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          {passwordRequirementsText}
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
