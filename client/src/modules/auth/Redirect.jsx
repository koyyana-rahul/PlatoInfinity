// src/modules/auth/Redirect.jsx
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
    const redirectUser = async () => {
      try {
        const res = await Axios(summaryApi.me);
        const user = res?.data?.data;

        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        dispatch(setUserDetails(user));

        /* ================= STAFF (NO EMAIL CHECK) ================= */
        if (["CHEF", "WAITER", "CASHIER"].includes(user.role)) {
          if (!user.restaurantId || !user.brand?.slug) {
            toast.error("Restaurant or brand not assigned");
            navigate("/staff/login", { replace: true });
            return;
          }

          dispatch(setBrandDetails(user.brand));

          navigate(
            `/${user.brand.slug}/staff/${user.role.toLowerCase()}/restaurants/${
              user.restaurantId
            }`,
            { replace: true }
          );
          return;
        }

        /* ================= EMAIL USERS ================= */
        if (!user.verify_email) {
          toast.error("Please verify your email");
          navigate("/login", { replace: true });
          return;
        }

        if (!user.brand?.slug) {
          navigate("/onboarding/create-brand", { replace: true });
          return;
        }

        dispatch(setBrandDetails(user.brand));

        if (user.role === "BRAND_ADMIN") {
          navigate(`/${user.brand.slug}/admin/dashboard`, { replace: true });
          return;
        }

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

        toast.error("Unsupported role");
        navigate("/login", { replace: true });
      } catch (err) {
        console.error("Redirect error:", err);
        navigate("/login", { replace: true });
      }
    };

    redirectUser();
  }, [dispatch, navigate]);

  return null;
}
