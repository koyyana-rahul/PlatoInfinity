import React, { useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SummaryApi from "../../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../../utils/AxiosToastError";
import Axios from "../../utils/Axios";
import useMobile from "../../hooks/useMobile";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile] = useMobile();

  const validValue = Object.values(data).every((el) => el);

  useEffect(() => {
    if (!location?.state?.email) {
      toast.error("Please verify OTP first");
      navigate("/forgot-password");
      return;
    }

    if (location?.state?.email) {
      setData((prev) => ({
        ...prev,
        email: location?.state?.email,
      }));
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.newPassword || !data.confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.resetPassword,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData({
          email: "",
          newPassword: "",
          confirmPassword: "",
        });
        navigate("/login");
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
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Create a strong new password for your account
          </p>
        </div>

        {/* Form */}
        <form className="grid gap-3 sm:gap-4" onSubmit={handleSubmit}>
          {/* New Password */}
          <PasswordInput
            label="New Password"
            name="newPassword"
            value={data.newPassword}
            onChange={handleChange}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            disabled={loading}
            placeholder="Minimum 6 characters"
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={data.confirmPassword}
            onChange={handleChange}
            show={showConfirmPassword}
            toggle={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
            placeholder="Re-enter your password"
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
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Login */}
        <p className="text-xs sm:text-sm text-center mt-6 text-gray-700">
          <Link
            to="/login"
            className="font-semibold text-[#E65F41] hover:underline transition"
          >
            Back to Login
          </Link>
        </p>

        {/* Security Info */}
        <p className="text-xs text-center mt-4 text-gray-500">
          🔒 Use a strong password with letters, numbers, and symbols
        </p>
      </div>
    </section>
  );
};

export default ResetPassword;

/* ===========================
   Reusable Password Input Component
=========================== */

function PasswordInput({ label, show, toggle, disabled, ...props }) {
  return (
    <div className="grid gap-1 sm:gap-1.5">
      <label className="text-xs sm:text-sm font-medium text-[#1A1C1E]">
        {label}
      </label>
      <div
        className="flex items-center border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5
                      focus-within:border-[#E65F41] focus-within:ring-2 focus-within:ring-[#E65F41]/20
                      disabled:bg-gray-100
                      transition duration-200"
      >
        <input
          {...props}
          disabled={disabled}
          type={show ? "text" : "password"}
          className="w-full outline-none text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
        />
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          className="text-gray-600 ml-2 hover:text-[#E65F41] transition disabled:cursor-not-allowed"
        >
          {show ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
        </button>
      </div>
    </div>
  );
}
