import React, { useState } from "react";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from "react-hot-toast";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import AxiosToastError from "../../utils/AxiosToastError";
import { Link, useNavigate } from "react-router-dom";
import fetchUserDetails from "../../utils/fetchUserDetails";
import { useDispatch } from "react-redux";
import { setUserDetails } from "../../store/userSlice";
import useMobile from "../../hooks/useMobile";

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile] = useMobile();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        ...SummaryApi.login,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);

        const userDetails = await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));

        setData({
          email: "",
          password: "",
        });

        // Multi-tenant redirection logic
        if (!userDetails.data.brandId) {
          // No brand associated, redirect to create brand onboarding
          navigate("/onboarding/create-brand");
        } else {
          // Brand exists, redirect to brand-specific dashboard based on role
          const brandSlug = userDetails.data.brandId; // Assuming brandId can be used as slug for now
          switch (userDetails.data.role) {
            case "Admin":
            case "Owner": // Assuming Owner role also uses Admin dashboard initially
              navigate(`/${brandSlug}/dashboard`); // Redirect to Admin dashboard
              break;
            case "Manager":
              navigate(`/${brandSlug}/dashboard`); // Redirect to Manager dashboard (placeholder)
              break;
            case "Chef":
              navigate(`/${brandSlug}/dashboard`); // Redirect to Chef dashboard (placeholder)
              break;
            case "Waiter":
              navigate(`/${brandSlug}/dashboard`); // Redirect to Waiter dashboard (placeholder)
              break;
            case "Customer":
              navigate(`/${brandSlug}/dashboard`); // Redirect to Customer dashboard (placeholder)
              break;
            default:
              navigate("/"); // Fallback to home if role not recognized
              break;
          }
        }
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
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Login to manage your restaurant
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

          {/* Password */}
          <div>
            <PasswordInput
              label="Password"
              name="password"
              value={data.password}
              onChange={handleChange}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              disabled={loading}
            />
            <Link
              to="/forgot-password"
              className="inline-block mt-2 text-xs sm:text-sm font-medium text-[#E65F41] hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>

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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 sm:my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-xs sm:text-sm text-gray-600">OR</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Footer */}
        <p className="text-xs sm:text-sm text-center text-gray-700">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#E65F41] hover:underline transition"
          >
            Register here
          </Link>
        </p>

        {/* Security Note */}
        <p className="text-xs text-center mt-4 text-gray-500 px-2">
          🔒 Your login credentials are secure and encrypted
        </p>
      </div>
    </section>
  );
};

export default Login;

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
