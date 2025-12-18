import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import AxiosToastError from "../../utils/AxiosToastError";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
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
        const response = await Axios.post(SummaryApi.verifyEmail.url, { code });

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
    <div className="container mx-auto px-4 flex justify-center items-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        {verificationStatus === "verifying" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
            <p>Please wait a moment.</p>
          </div>
        )}
        {verificationStatus === "success" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Email Verified Successfully!
            </h2>
            <p>You will be redirected to the login page in 3 seconds...</p>
            <Link
              to="/login"
              className="mt-4 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
              Go to Login Now
            </Link>
          </div>
        )}
        {verificationStatus === "error" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">
              Verification Failed
            </h2>
            <p>The verification link is invalid or has expired.</p>
            <Link
              to="/register"
              className="mt-4 inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            >
              Go to Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
