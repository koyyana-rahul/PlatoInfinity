import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import Axios from "./api/axios";
import SummaryApi from "./api/summaryApi";
import { setUserDetails, logout } from "./store/auth/userSlice";

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <div className="h-screen flex items-center justify-center bg-slate-950 text-white">
      <p className="text-sm tracking-wide animate-pulse">Initializing Plato…</p>
    </div>
  );
};

export default App;
