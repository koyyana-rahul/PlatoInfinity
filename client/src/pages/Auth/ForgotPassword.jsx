import React, { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import AxiosToastError from "../../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";
import useMobile from "../../hooks/useMobile";

const ForgotPassword = () => {
  const [data, setData] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [isMobile] = useMobile();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.forgotPassword,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/verification-otp", {
          state: {
            email: data.email,
          },
        });
        setData({
          email: "",
        });
      }
    } catch (error) {
      AxiosToastError(error);
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-3 py-8 sm:px-4 md:px-6">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8">
        {/* Heading */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1C1E]">
            Forgot Password?
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Enter your email to receive reset instructions
          </p>
        </div>

        {/* Form */}
        <form className="grid gap-3 sm:gap-4" onSubmit={handleSubmit}>
          {/* Email */}
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
            placeholder="owner@restaurant.com"
            autoFocus
            disabled={loading}
          />

          {/* Submit */}
          <button
            disabled={!validValue || loading}
            className={`mt-2 sm:mt-4 py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition duration-300
              ${
                validValue && !loading
                  ? "bg-[#E65F41] hover:bg-[#d65339] active:scale-95"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-xs sm:text-sm text-center mt-6 text-gray-700">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#E65F41] hover:underline transition"
          >
            Login here
          </Link>
        </p>

        {/* Help Text */}
        <p className="text-xs text-center mt-4 text-gray-500">
          💡 Check your email (including spam folder) for the OTP
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;

/* ===========================
   Reusable Input Component
=========================== */

function Input({ label, disabled, ...props }) {
  return (
    <div className="grid gap-1 sm:gap-1.5">
      <label className="text-xs sm:text-sm font-medium text-[#1A1C1E]">
        {label}
      </label>
      <input
        {...props}
        disabled={disabled}
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border border-gray-300
                   focus:outline-none focus:border-[#E65F41] focus:ring-2 focus:ring-[#E65F41]/20
                   disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
                   transition duration-200"
      />
    </div>
  );
}
