import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import AxiosToastError from "../../utils/AxiosToastError";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useMobile from "../../hooks/useMobile";

const OtpVerification = () => {
  const [data, setData] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isMobile] = useMobile();
  const navigate = useNavigate();
  const inputRef = useRef([]);
  const location = useLocation();

  useEffect(() => {
    if (!location?.state?.email) {
      navigate("/forgot-password");
    }
  }, [navigate, location]);

  const validValue = data.every((el) => el);

  const handleInputChange = (e, index) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) return;

    const newData = [...data];
    newData[index] = value;
    setData(newData);

    // Auto-focus next input
    if (value && index < 5) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !data[index] && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.join("").length !== 6) {
      toast.error("Please enter all 6 digits of OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.forgot_password_otp_verification,
        data: {
          otp: data.join(""),
          email: location?.state?.email,
        },
      });

      if (response.data.error) {
        toast.error(response.data.message);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData(["", "", "", "", "", ""]);
        navigate("/reset-password", {
          state: {
            data: response.data,
            email: location?.state?.email,
          },
        });
      }
    } catch (error) {
      AxiosToastError(error);
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-3 py-8 sm:px-4 md:px-6">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8">
        {/* Heading */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1A1C1E]">
            Verify Your OTP
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Form */}
        <form className="grid gap-4 sm:gap-6" onSubmit={handleSubmit}>
          {/* OTP Inputs */}
          <div className="grid gap-2 sm:gap-3">
            <label className="text-xs sm:text-sm font-medium text-[#1A1C1E]">
              OTP Code
            </label>
            <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
              {data.map((element, index) => (
                <input
                  key={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  ref={(ref) => {
                    inputRef.current[index] = ref;
                  }}
                  value={data[index]}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  maxLength={1}
                  disabled={loading}
                  className="w-10 h-10 sm:w-12 sm:h-12 p-0 text-center text-lg sm:text-xl font-bold rounded-lg border-2 border-gray-300
                             focus:outline-none focus:border-[#E65F41] focus:ring-2 focus:ring-[#E65F41]/20
                             disabled:bg-gray-100 disabled:cursor-not-allowed
                             transition duration-200"
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={!validValue || loading}
            className={`py-2.5 sm:py-3 rounded-xl font-semibold text-white text-sm sm:text-base transition duration-300
              ${
                validValue && !loading
                  ? "bg-[#E65F41] hover:bg-[#d65339] active:scale-95"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend OTP */}
        <p className="text-xs sm:text-sm text-center mt-6 text-gray-700">
          Didn't receive code?{" "}
          <button
            type="button"
            className="font-semibold text-[#E65F41] hover:underline transition"
          >
            Resend OTP
          </button>
        </p>

        {/* Back to Login */}
        <p className="text-xs sm:text-sm text-center mt-4 text-gray-700">
          <Link
            to="/login"
            className="font-semibold text-[#E65F41] hover:underline transition"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default OtpVerification;
