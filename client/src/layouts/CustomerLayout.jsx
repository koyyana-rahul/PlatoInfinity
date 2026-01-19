// src/layouts/CustomerLayout.jsx
import { Outlet, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomerHeader from "../components/headers/CustomerHeader";
import Axios from "../api/axios";
import customerApi from "../api/customer.api";
import { setBrandDetails } from "../store/brand/brandSlice";

export default function CustomerLayout() {
  const { tableId } = useParams();
  const dispatch = useDispatch();
  const brand = useSelector((s) => s.brand);

  useEffect(() => {
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

    if (!brand._id && tableId) {
      hydrateBrand();
    }
  }, [brand._id, tableId, dispatch]);

  if (!tableId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFA]">
      {/* HEADER */}
      <CustomerHeader />

      {/* CONTENT */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}
