import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import AuthAxios from "../../api/authAxios";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    AuthAxios.get(`/api/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        toast.success("Email verified successfully");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      })
      .catch((err) => {
        setStatus("error");
        toast.error(
          err?.response?.data?.message || "Verification failed or link expired"
        );
      });
  }, [navigate, params]);

  return (
    <section className="min-h-screen flex items-center justify-center">
      {status === "loading" && <p>Verifying email…</p>}
      {status === "success" && (
        <>
          <FaCheckCircle size={48} className="text-green-600" />
          <p>Email verified. Redirecting…</p>
        </>
      )}
      {status === "error" && (
        <>
          <FaTimesCircle size={48} className="text-red-500" />
          <p>Verification failed</p>
        </>
      )}
    </section>
  );
}
