import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import store from "./store";
import router from "./router";

import Axios from "../api/axios";
import SummaryApi from "../api/summaryApi";
import { setUserDetails, markHydrated } from "../store/auth/userSlice";
import { setBrandDetails, clearBrand } from "../store/brand/brandSlice";
import { SocketProvider } from "../socket/SocketProvider";

function Bootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    async function hydrateAuth() {
      try {
        const pathname =
          typeof window !== "undefined" ? window.location.pathname : "";
        if (pathname.includes("/table/")) {
          return;
        }

        const res = await Axios(SummaryApi.me);

        const user = res.data.data;
        dispatch(setUserDetails(user));

        if (user.brand) {
          dispatch(setBrandDetails(user.brand));
        } else {
          dispatch(clearBrand());
        }
      } catch (err) {
        // user not logged in OR cookie expired
      } finally {
        // 🚨 THIS IS THE KEY
        dispatch(markHydrated());
      }
    }

    hydrateAuth();
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default function Providers() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <Bootstrap />
        <Toaster position="top-right" />
      </SocketProvider>
    </Provider>
  );
}
