import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import summaryApi from "../../api/summaryApi";

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
    toast.error("Invalid password reset flow");
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
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
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
        toast.success("Password reset successful");
        navigate("/login", { replace: true });
      } else {
        toast.error(res.data.message || "Reset failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A1C1E]">Reset Password</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create a new secure password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (readonly) */}
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600"
          />

          {/* New Password */}
          <div className="flex items-center border rounded-lg bg-gray-50 px-3">
            <input
              type={showPwd ? "text" : "password"}
              name="newPassword"
              placeholder="New password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full py-2 bg-transparent outline-none"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="flex items-center border rounded-lg bg-gray-50 px-3">
            <input
              type={showConfirmPwd ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full py-2 bg-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
            >
              {showConfirmPwd ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            className="w-full bg-[#E65F41] hover:bg-[#d65339] text-white py-2.5 rounded-xl font-semibold transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ResetPassword;
