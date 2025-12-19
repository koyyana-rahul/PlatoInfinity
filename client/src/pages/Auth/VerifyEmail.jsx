import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import AxiosToastError from "../../utils/AxiosToastError";
import useMobile from "../../hooks/useMobile";
import { Check, X, Loader } from "lucide-react";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [isMobile] = useMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      if (!code) {
        setVerificationStatus("error");
        toast.error("Invalid verification link. Code not found.");
        return;
      }

      try {
        const response = await Axios.post(SummaryApi.verifyEmail.url, {
          code,
        });

        if (response.data.success) {
          setVerificationStatus("success");
          toast.success(response.data.message);
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setVerificationStatus("error");
          toast.error(response.data.message);
        }
      } catch (error) {
        setVerificationStatus("error");
        AxiosToastError(error);
      }
    };

    verify();
  }, [location, navigate]);

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-3 py-8 sm:px-4 md:px-6">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 text-center">
        {verificationStatus === "verifying" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#E65F41]/20 rounded-full animate-pulse"></div>
              <Loader
                size={isMobile ? 40 : 50}
                className="text-[#E65F41] animate-spin relative"
              />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1C1E] mb-2">
                Verifying your email...
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Please wait while we confirm your email address
              </p>
            </div>
          </div>
        )}

        {verificationStatus === "success" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="bg-green-100 rounded-full p-3 sm:p-4">
              <Check
                size={isMobile ? 32 : 40}
                className="text-green-600"
                strokeWidth={3}
              />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-2">
                Email Verified!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Your email has been successfully verified. Redirecting to
                login...
              </p>
              <Link
                to="/login"
                className="inline-block bg-[#E65F41] text-white font-semibold py-2 sm:py-2.5 px-6 sm:px-8 rounded-xl hover:bg-[#d65339] transition active:scale-95 text-sm sm:text-base"
              >
                Go to Login Now
              </Link>
            </div>
          </div>
        )}

        {verificationStatus === "error" && (
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="bg-red-100 rounded-full p-3 sm:p-4">
              <X
                size={isMobile ? 32 : 40}
                className="text-red-600"
                strokeWidth={3}
              />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-2">
                Verification Failed
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-6">
                The verification link is invalid or has expired. Please try
                registering again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-block bg-[#E65F41] text-white font-semibold py-2 sm:py-2.5 px-6 sm:px-8 rounded-xl hover:bg-[#d65339] transition active:scale-95 text-sm sm:text-base"
                >
                  Register Again
                </Link>
                <Link
                  to="/login"
                  className="inline-block bg-gray-200 text-[#1A1C1E] font-semibold py-2 sm:py-2.5 px-6 sm:px-8 rounded-xl hover:bg-gray-300 transition active:scale-95 text-sm sm:text-base"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default VerifyEmail;
