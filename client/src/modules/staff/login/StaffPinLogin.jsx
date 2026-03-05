import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";
import SummaryApi from "../../../api/summaryApi";
import { setUserDetails } from "../../../store/auth/userSlice";
import { setBrandDetails } from "../../../store/brand/brandSlice";

export default function StaffLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();

  const qrToken = params.get("token"); // 🔑 from QR

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  /* ===============================
     SAFETY: QR REQUIRED
  =============================== */
  if (!qrToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-sm w-full shadow-lg text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle
              className="text-red-600"
              size={28}
              strokeWidth={2.5}
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-gray-600">
            Please scan the QR code at the restaurant to continue.
          </p>
        </div>
      </div>
    );
  }

  /* ===============================
     LOGIN
  =============================== */
  const handleLogin = async () => {
    setError("");

    if (pin.length !== 4) {
      setError("Please enter your 4-digit PIN");
      toast.error("Enter 4-digit staff PIN");
      return;
    }

    try {
      setLoading(true);

      const res = await Axios({
        ...staffApi.staffLogin,
        data: {
          staffPin: pin,
          qrToken,
        },
      });

      // ✅ Store JWT token in localStorage for subsequent requests
      if (res.data?.data?.accessToken) {
        localStorage.setItem("authToken", res.data.data.accessToken);
        console.log("✅ JWT token stored in localStorage");
      }

      // Hydrate full profile (sets brand + role + restaurantId + onDuty etc)
      const meRes = await Axios(SummaryApi.me);
      const user = meRes?.data?.data;
      if (user) {
        dispatch(setUserDetails(user));
        if (user.brand) dispatch(setBrandDetails(user.brand));

        navigate(
          `/${user.brand.slug}/staff/${user.role.toLowerCase()}/restaurants/${
            user.restaurantId
          }`,
          { replace: true },
        );
      } else {
        // fallback to response data
        const { role, restaurantId, brandSlug } = res.data.data;
        navigate(
          `/${brandSlug}/staff/${role.toLowerCase()}/restaurants/${restaurantId}`,
          { replace: true },
        );
      }
    } catch (error) {
      console.error("Staff login error:", error);
      const errorMsg =
        error?.response?.data?.message || "Invalid PIN or expired QR";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setPin("");
    }
  };

  /* ===============================
     HANDLE PIN CHANGE
  =============================== */
  const handlePinChange = (value) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 4);
    setPin(numericValue);
    if (error) setError(""); // Clear error on input
  };

  /* ===============================
     HANDLE ENTER KEY
  =============================== */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleLogin();
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header with Gradient - Swiggy/Zomato Style */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🔑</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">Staff Login</h1>
              <p className="text-orange-100 text-sm">Enter your secure PIN</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            {/* QR Success Badge */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3">
              <div className="flex items-center gap-2">
                <FiCheckCircle
                  className="text-green-600 flex-shrink-0"
                  size={18}
                  strokeWidth={2.5}
                />
                <p className="text-sm text-green-800 font-medium">
                  QR verified • Enter PIN to continue
                </p>
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <FiLock
                      className="text-orange-600"
                      size={16}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span>Staff PIN</span>
                </div>
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••"
                  disabled={loading}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-4
                           text-center tracking-[0.8em] text-2xl font-bold text-gray-900
                           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                           transition-all bg-gray-50
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Enter 4-digit PIN"
                  autoComplete="off"
                />
                {pin.length > 0 && pin.length < 4 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                      {pin.length}/4
                    </span>
                  </div>
                )}
              </div>

              {/* PIN Dots */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      pin.length > index
                        ? "bg-gradient-to-r from-orange-500 to-red-500 scale-125 shadow-lg"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <FiAlertCircle
                    size={18}
                    strokeWidth={2.5}
                    className="flex-shrink-0"
                  />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button - Swiggy/Zomato Style */}
            <button
              onClick={handleLogin}
              disabled={loading || pin.length !== 4}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4
                       font-bold text-base transition-all shadow-lg hover:shadow-xl
                       disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying...</span>
                </span>
              ) : (
                "Access Dashboard"
              )}
            </button>

            {/* Security Note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🔒 Secure encrypted connection
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-center text-gray-600 mt-6">
          Need help?{" "}
          <span className="text-orange-600 font-semibold">
            Contact your manager
          </span>
        </p>
      </div>
    </div>
  );
}
