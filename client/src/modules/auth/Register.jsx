import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Axios from "../../api/axios";
import SummaryApi from "../../api/summaryApi";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successEmail, setSuccessEmail] = useState(null); // 🔑 KEY

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const isValid =
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await Axios({
        ...SummaryApi.register,
        data: {
          name: form.name,
          email: form.email,
          password: form.password,
        },
      });

      // ✅ DO NOT REDIRECT
      setSuccessEmail(form.email);
      toast.success("Verification email sent");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (successEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#FC8019] to-[#FF6B35] flex items-center justify-center shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">
                Verify Your Email
              </h1>
              <p className="text-sm text-gray-600 text-center">
                We've sent a verification link to:
              </p>
              <p className="font-semibold text-[#FC8019] text-center break-all">
                {successEmail}
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-gray-700 text-center">
                Please check your inbox and spam folder for the verification
                link.
              </div>

              <Link
                to="/login"
                className="mt-6 inline-flex items-center space-x-2 px-6 h-11 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-xl transition-all shadow-lg active:scale-[0.98]"
              >
                <span>Go to Login</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                Didn't receive the email? Check your spam folder or contact
                support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="w-full max-w-md mx-auto mb-6 sm:mb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#FC8019] to-[#FF6B35] mb-4 sm:mb-6 shadow-lg">
            <ShieldAlert className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Join Plato OS to get started
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 sm:p-8 space-y-6">
          <form className="space-y-5" onSubmit={submit}>
            {/* Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-800"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all bg-gray-50 focus:bg-white"
              />
            </div>

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
                  autoComplete="new-password"
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
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all bg-gray-50 focus:bg-white pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#FC8019] transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Match Indicator */}
            {form.password && form.confirmPassword && (
              <div
                className={`text-sm px-3 py-2 rounded-xl flex items-center space-x-2 ${
                  form.password === form.confirmPassword
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {form.password === form.confirmPassword ? (
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

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`w-full h-11 px-4 rounded-xl text-base font-semibold text-white transition-all duration-200 ${
                !isValid || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] hover:shadow-xl active:scale-[0.98] shadow-lg"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Creating account...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Create Account</span>
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
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            to="/login"
            className="w-full h-11 flex items-center justify-center rounded-xl text-base font-semibold text-[#FC8019] bg-orange-50 hover:bg-orange-100 transition-colors border border-orange-200"
          >
            Sign In
          </Link>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By creating an account, you agree to our{" "}
          <span className="text-[#FC8019] font-medium hover:underline cursor-pointer">
            Terms & Conditions
          </span>
        </p>
      </div>
    </div>
  );
}
