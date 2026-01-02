import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Axios from "../../../api/axios";
import toast from "react-hot-toast";

export default function SetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!token) {
      toast.error("Invalid request");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await Axios.post("/api/auth/set-password", { token, password });

      toast.success("Password set successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to set password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FBFA] px-4">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-md space-y-5">
        <h1 className="text-xl font-bold text-gray-900">
          Set Your Password
        </h1>

        <input
          type="password"
          className="input"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          className="input"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={submit}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Saving…" : "Set Password"}
        </button>
      </div>
    </div>
  );
}