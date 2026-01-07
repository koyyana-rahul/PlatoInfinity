import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import summaryApi from "../../api/summaryApi";

import { setUserDetails } from "../../store/auth/userSlice";
import { setBrandDetails } from "../../store/brand/brandSlice";

export default function Redirect() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        /* ================= FETCH CURRENT USER ================= */
        const res = await Axios(summaryApi.me);
        const user = res.data?.data;

        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        /* ================= STORE USER ================= */
        dispatch(setUserDetails(user));

        /* ================= EMAIL CHECK ================= */
        if (!user.verify_email) {
          toast.error("Please verify your email first");
          navigate("/login", { replace: true });
          return;
        }

        /* ================= BRAND CHECK ================= */
        if (!user.brand) {
          navigate("/onboarding/create-brand", { replace: true });
          return;
        }

        /* ================= STORE BRAND ================= */
        dispatch(setBrandDetails(user.brand));

        /* ================= ROLE BASED REDIRECT ================= */

        // 🔐 BRAND ADMIN
        if (user.role === "BRAND_ADMIN") {
          navigate(`/${user.brand.slug}/admin/dashboard`, { replace: true });
          return;
        }

        // 🧑‍💼 MANAGER
        if (user.role === "MANAGER") {
          if (!user.restaurantId) {
            toast.error("Restaurant not assigned");
            navigate("/login", { replace: true });
            return;
          }

          navigate(
            `/${user.brand.slug}/manager/restaurants/${user.restaurantId}/dashboard`,
            { replace: true }
          );
          return;
        }

        /* ================= FALLBACK ================= */
        toast.error("Unsupported user role");
        navigate("/login", { replace: true });
      } catch (err) {
        console.error("Redirect error:", err);
        navigate("/login", { replace: true });
      }
    };

    if (isMounted) bootstrap();

    return () => {
      isMounted = false;
    };
  }, [dispatch, navigate]);

  return null; // purely logical route
}
