import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Axios from "./api/axios";
import { initAxiosInterceptors } from "./api/axios.interceptor";
import SummaryApi from "./api/summaryApi";
import { setUserDetails, logout } from "./store/auth/userSlice";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Initialize axios interceptors on app start
    initAxiosInterceptors();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const pathname =
          typeof window !== "undefined" ? window.location.pathname : "";
        if (pathname.includes("/table/")) {
          return;
        }

        const res = await Axios({
          ...SummaryApi.me,
        });

        if (res.data?.success) {
          dispatch(setUserDetails(res.data.data));
          navigate("/redirect", { replace: true });
        } else {
          dispatch(logout());
          navigate("/login", { replace: true });
        }
      } catch (error) {
        dispatch(logout());
        navigate("/login", { replace: true });
      }
    };

    initAuth();
  }, [dispatch, navigate]);

  // minimal loader
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <img
              className="mx-auto h-12 w-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
              alt="Workflow"
            />
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="text-lg font-medium text-gray-700">
              Initializing Plato...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
