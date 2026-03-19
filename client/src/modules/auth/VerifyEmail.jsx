import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { notify } from "../../utils/notify";
import AuthAxios from "../../api/authAxios";
import AuthLogo from "./components/AuthLogo";

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
        notify.success("Email verified successfully");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      })
      .catch((err) => {
        setStatus("error");
        notify.error(
          err?.response?.data?.message || "Verification failed or link expired",
        );
      });
  }, [navigate, params]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <AuthLogo className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">
            Email Verification
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 text-[#FC8019] animate-spin" />
                <p className="text-lg font-medium text-gray-700 text-center">
                  Verifying email...
                </p>
                <p className="text-sm text-gray-500 text-center">
                  Please wait while we verify your email address
                </p>
              </>
            )}
            {status === "success" && (
              <>
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Email Verified Successfully!
                  </p>
                  <p className="text-sm text-gray-600">
                    Redirecting to login...
                  </p>
                </div>
              </>
            )}
            {status === "error" && (
              <>
                <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    Verification Failed
                  </p>
                  <p className="text-sm text-gray-600">
                    The verification link has expired or is invalid
                  </p>
                </div>
                {/* <button
                  onClick={() => navigate("/login")}
                  className="mt-4 px-6 h-11 bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-xl transition-all shadow-lg active:scale-[0.98]"
                >
                  Go to Login
                </button> */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
