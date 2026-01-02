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
    const bootstrap = async () => {
      try {
        const { data } = await Axios(summaryApi.me);
        const user = data.data;

        dispatch(setUserDetails(user));

        if (!user.verify_email) {
          toast.error("Please verify your email first");
          navigate("/login", { replace: true });
          return;
        }

        if (!user.brand) {
          navigate("/onboarding/create-brand", { replace: true });
          return;
        }

        if (user.role === "BRAND_ADMIN") {
          dispatch(setBrandDetails(user.brand));
          navigate(`/${user.brand.slug}/admin/dashboard`, { replace: true });
          return;
        }

        if (user.role === "MANAGER") {
          navigate(
            `/${user.brand.slug}/admin/restaurants/${user.restaurantId}/dashboard`,
            { replace: true }
          );
        }

        toast.error("Unsupported role");
        navigate("/login");
      } catch {
        navigate("/login", { replace: true });
      }
    };

    bootstrap();
  }, []);

  return null;
}
