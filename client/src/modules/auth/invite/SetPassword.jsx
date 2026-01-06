// src/modules/auth/invite/SetPassword.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import authApi from "../../../api/auth.api";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function SetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------- SAFETY CHECK ---------- */
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing invite token");
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  /* ---------- SUBMIT ---------- */
  const submit = async () => {
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await Axios({
        ...authApi.setPassword,
        data: { token, password },
      });

      toast.success("Password set successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("SetPassword error:", err);
      toast.error(err?.response?.data?.message || "Unable to set password");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FBFA] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold text-gray-900">
            Set Your Password
          </h2>
          <p className="text-sm text-gray-500">Secure your manager account</p>
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full h-11 rounded-lg border border-gray-300 px-3 pr-10 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <p className="text-xs text-gray-400">Minimum 6 characters</p>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Confirm Password
          </label>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className="w-full h-11 rounded-lg border border-gray-300 px-3 pr-10 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Re-enter the same password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* INFO */}
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800">
          🔐 This password will be used to log in as a manager.
        </div>

        {/* ACTION */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : "Set Password"}
        </button>
      </div>
    </div>
  );
}
