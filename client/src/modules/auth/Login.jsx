import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { notify } from "../../utils/notify";
import { useDispatch } from "react-redux";

import Axios from "../../api/axios";
import SummaryApi from "../../api/summaryApi";
import { setUserDetails } from "../../store/auth/userSlice";
import { setBrandDetails } from "../../store/brand/brandSlice";
import AuthLogo from "./components/AuthLogo";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      notify.error("Enter your email and password");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ LOGIN
      const loginRes = await Axios({
        ...SummaryApi.login,
        data: form,
      });

      // ✅ Store JWT token in localStorage for subsequent requests
      if (loginRes.data?.data?.accessToken) {
        localStorage.setItem("authToken", loginRes.data.data.accessToken);
        console.log("✅ JWT token stored in localStorage");
      }

      await new Promise((r) => setTimeout(r, 200));

      // 2️⃣ FETCH USER
      const meRes = await Axios(SummaryApi.me);
      const user = meRes.data.data;

      dispatch(setUserDetails(user));

      if (user.brand) {
        dispatch(setBrandDetails(user.brand));
      }

      notify.success("Welcome back");
      navigate("/redirect", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      const code = err?.response?.data?.code;

      if (status === 403) {
        notify.error("Please verify your email before logging in");
      } else if (status === 404 || code === "ACCOUNT_NOT_FOUND") {
        notify.error("Account doesn't exist. Please create an account first.");
      } else if (status === 401) {
        notify.error("Invalid email or password");
      } else {
        notify.error(message || "Login failed");
      }
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
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your Plato OS account
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 sm:p-8 space-y-6">
          <form className="space-y-5" onSubmit={submit}>
            {/* Email Input */}
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
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-800"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#FC8019] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#FC8019] rounded focus:ring-[#FC8019]/40 border-gray-300 transition-all"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-[#FC8019] hover:text-[#FF6B35] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
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
                  <span>Signing in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Sign In</span>
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
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/register"
            className="w-full h-11 flex items-center justify-center rounded-xl text-base font-semibold text-[#FC8019] bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200"
          >
            Create Account
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By signing in, you agree to our{" "}
          <span className="text-[#FC8019] font-medium hover:underline cursor-pointer">
            Terms & Conditions
          </span>
        </p>
      </div>
    </div>
  );
}
