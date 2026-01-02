import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import summaryApi from "../../api/summaryApi";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const res = await Axios({
        ...summaryApi.forgotPassword,
        data: { email },
      });

      if (res.data.success) {
        toast.success("OTP sent to your email");

        // 👉 Move to OTP verification
        navigate("/verify-otp", {
          state: { email },
        });
      } else {
        toast.error(res.data.message || "Failed to send OTP");
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
          <h1 className="text-2xl font-bold text-[#1A1C1E]">Forgot Password</h1>
          <p className="text-sm text-gray-600 mt-2">
            Enter your registered email to receive OTP
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-[#E65F41]/30"
          />

          <button
            disabled={loading}
            className="w-full bg-[#E65F41] hover:bg-[#d65339]
                       text-white py-2.5 rounded-xl font-semibold transition"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-center mt-5 text-gray-700">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#E65F41] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;
