import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

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

  /* ===============================
     SAFETY: QR REQUIRED
  =============================== */
  if (!qrToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 font-medium">
          Invalid access. Please scan QR inside restaurant.
        </p>
      </div>
    );
  }

  /* ===============================
     LOGIN
  =============================== */
  const handleLogin = async () => {
    if (pin.length !== 4) {
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
      toast.error(
        error?.response?.data?.message || "Invalid PIN or expired QR",
      );
    } finally {
      setLoading(false);
      setPin("");
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Staff Login</h1>
          <p className="text-sm text-gray-500 mt-1">Scan QR & enter your PIN</p>
        </div>

        {/* PIN */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-3
                         text-center tracking-widest text-lg
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 text-white py-3
                       font-medium hover:bg-emerald-700
                       disabled:opacity-60 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Access valid only during active shift
          </p>
        </div>
      </div>
    </div>
  );
}
