import { Outlet, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomerHeader from "../components/headers/CustomerHeader";

import Axios from "../api/axios";
import customerApi from "../api/customer.api";

import { setBrandDetails } from "../store/brand/brandSlice";
import { fetchCustomerOrders } from "../store/customer/orderThunks";

/**
 * CustomerLayout
 * --------------------------------------------------
 * Responsibilities:
 * 1. Validate tableId
 * 2. Hydrate brand (PUBLIC API)
 * 3. Fetch customer orders (SESSION API – refresh safe)
 * 4. Provide consistent customer UI shell
 */
export default function CustomerLayout() {
  const { tableId } = useParams();
  const dispatch = useDispatch();

  const brand = useSelector((s) => s.brand);

  /* ===============================
     GUARD: INVALID TABLE
  =============================== */
  if (!tableId) {
    return <Navigate to="/" replace />;
  }

  /* ===============================
     GET CUSTOMER SESSION (SAFE)
  =============================== */
  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);

  /* ===============================
     HYDRATE BRAND (PUBLIC API)
     - Runs only once
  =============================== */
  useEffect(() => {
    if (!tableId || brand?._id) return;

    const hydrateBrand = async () => {
      try {
        const res = await Axios(customerApi.publicTable(tableId));
        const table = res.data?.data;

        if (table?.brand?._id) {
          dispatch(setBrandDetails(table.brand));
        }
      } catch (err) {
        console.error("CustomerLayout: brand hydration failed", err);
      }
    };

    hydrateBrand();
  }, [tableId, brand?._id, dispatch]);

  /* ===============================
     FETCH ORDERS (CRITICAL FIX)
     - Only if session exists
     - Makes Orders button survive refresh
  =============================== */
  useEffect(() => {
    if (!sessionId) return;

    dispatch(fetchCustomerOrders(sessionId));
  }, [dispatch, sessionId]);

  /* ===============================
     UI SHELL
  =============================== */
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFA]">
      {/* ================= HEADER ================= */}
      <CustomerHeader />

      {/* ================= CONTENT ================= */}
      <main
        className="
          flex-1 w-full
          max-w-7xl mx-auto
          px-3 sm:px-6
          py-4
        "
      >
        <Outlet />
      </main>

      {/* ================= SAFE BOTTOM SPACE =================
         Prevents StickyCartBar overlap
      ====================================================== */}
      <div className="h-20" />
    </div>
  );
}
