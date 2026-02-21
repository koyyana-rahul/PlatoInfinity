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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            {status === "loading" && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="text-lg font-medium text-gray-700">
                  Verifying email...
                </p>
              </>
            )}
            {status === "success" && (
              <>
                <FaCheckCircle size={48} className="text-green-600" />
                <p className="text-lg font-medium text-gray-700">
                  Email verified successfully. Redirecting to login...
                </p>
              </>
            )}
            {status === "error" && (
              <>
                <FaTimesCircle size={48} className="text-red-500" />
                <p className="text-lg font-medium text-gray-700">
                  Verification failed or link has expired.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
