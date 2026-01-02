import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [status, setStatus] = useState("loading");
  // loading | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      toast.error("Invalid invite link");
      return;
    }

    const verifyInvite = async () => {
      try {
        await Axios.get(`/api/auth/accept-invite?token=${token}`);
        setStatus("success");

        // short delay for UX
        setTimeout(() => {
          navigate(`/set-password?token=${token}`, { replace: true });
        }, 800);
      } catch (err) {
        console.error(err);
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
          <div className="animate-spin h-8 w-8 border-4 border-[#00684A] border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600">Verifying invitation…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FBFA] px-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Invite Invalid</h2>
          <p className="text-sm text-gray-600">
            This invitation link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null; // success auto-redirects
}
