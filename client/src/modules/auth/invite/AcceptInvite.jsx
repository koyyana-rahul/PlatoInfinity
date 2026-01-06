// src/modules/auth/invite/AcceptInvite.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import authApi from "../../../api/auth.api";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [status, setStatus] = useState("loading");
  // loading | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      toast.error("Invalid invite link");
      return;
    }

    const verifyInvite = async () => {
      try {
        await axios({
          baseURL: API_BASE,
          ...authApi.verifyInvite,
          params: { token },
        });

        // Small UX delay, then redirect
        setTimeout(() => {
          navigate(`/set-password?token=${token}`, { replace: true });
        }, 800);
      } catch (err) {
        console.error("Invite verification failed:", err);
        setStatus("error");
        toast.error(
          err?.response?.data?.message || "Invite expired or invalid"
        );
      }
    };

    verifyInvite();
  }, [token, navigate]);

  /* ================= UI ================= */

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBFA]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Verifying invitation…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBFA] px-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Invite Invalid or Expired
          </h2>
          <p className="text-sm text-gray-600">
            This invitation link is no longer valid.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null; // success redirects automatically
}