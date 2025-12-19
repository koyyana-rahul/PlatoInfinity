import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import SummaryApi from "../../common/SummaryApi";
import AxiosToastError from "../../utils/AxiosToastError";
import Axios from "../../utils/Axios";
import useMobile from "../../hooks/useMobile";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile] = useMobile();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const { name, email, password, confirmPassword } = data;
  const validValue = name && email && password && confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password must match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.register,
        data,
      });

      if (response.data?.error) {
        toast.error(response.data.message);
        setLoading(false);
        return;
      }

      if (response.data?.success) {
        toast.success(response.data.message);
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          mobile: "",
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
            Create your Plato account
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Start managing your restaurant digitally
          </p>
        </div>

        {/* Form */}
        <form className="grid gap-3 sm:gap-4" onSubmit={handleSubmit}>
          {/* Name */}
          <Input
            label="Full Name"
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="Restaurant owner name"
            autoFocus
            disabled={loading}
          />

          {/* Email */}
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={data.email}
            onChange={handleChange}
            placeholder="owner@restaurant.com"
            disabled={loading}
          />

          {/* Mobile */}
          <Input
            label="Mobile Number (optional)"
            name="mobile"
            type="tel"
            value={data.mobile}
            onChange={handleChange}
            placeholder="Used for alerts & recovery"
            disabled={loading}
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            name="password"
            value={data.password}
            onChange={handleChange}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            disabled={loading}
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
            {loading ? "Creating Account..." : "Get Started"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs sm:text-sm text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#E65F41] hover:underline transition"
          >
            Login
          </Link>
        </p>

        {/* Terms */}
        <p className="text-xs text-center mt-4 text-gray-500">
          By registering, you agree to our{" "}
          <Link to="#" className="text-[#E65F41] hover:underline">
            Terms & Conditions
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;

/* ===========================
   Reusable Input Components
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
