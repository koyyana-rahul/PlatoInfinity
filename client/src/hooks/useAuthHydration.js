import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Axios from "../api/axios";
import SummaryApi from "../api/summaryApi";
import { setUserDetails, markHydrated } from "../store/auth/userSlice";
import { setBrandDetails, clearBrand } from "../store/brand/brandSlice";

export default function useAuthHydration() {
  const dispatch = useDispatch();
  const hydrated = useSelector((s) => s.user.isHydrated);

  useEffect(() => {
    if (hydrated) return;

    const hydrate = async () => {
      try {
        const res = await Axios(SummaryApi.me);

        const user = res.data.data;
        dispatch(setUserDetails(user));

        if (user.brand) {
          dispatch(setBrandDetails(user.brand));
        } else {
          dispatch(clearBrand());
        }
      } catch {
        // not logged in
      } finally {
        dispatch(markHydrated());
      }
    };

    hydrate();
  }, [hydrated, dispatch]);
}
