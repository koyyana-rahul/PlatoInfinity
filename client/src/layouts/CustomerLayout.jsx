import { Outlet, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomerHeader from "../components/headers/CustomerHeader";
import Axios from "../api/axios";
import customerApi from "../api/customer.api";
import { setBrandDetails } from "../store/brand/brandSlice";
import { fetchCustomerOrders } from "../store/customer/orderThunks";

export default function CustomerLayout() {
  const { tableId } = useParams();
  const dispatch = useDispatch();
  const brand = useSelector((s) => s.brand);

  if (!tableId) return <Navigate to="/" replace />;

  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);

  useEffect(() => {
    if (tableId) {
      localStorage.setItem("plato:lastTableId", tableId);
    }
    if (!tableId || brand?._id) return;
    const hydrateBrand = async () => {
      try {
        const res = await Axios(customerApi.publicTable(tableId));
        const table = res.data?.data;
        if (table?.brand?._id) dispatch(setBrandDetails(table.brand));
      } catch (err) {
        console.error("Hydration failed", err);
      }
    };
    hydrateBrand();
  }, [tableId, brand?._id, dispatch]);

  useEffect(() => {
    if (!sessionId) return;
    dispatch(fetchCustomerOrders(sessionId));
  }, [dispatch, sessionId]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fff7f2] via-white to-[#f8fafc] selection:bg-orange-100 selection:text-orange-900 antialiased font-sans text-slate-900">
      {/* 1. BRAND HEADER */}
      <div className="block w-full bg-transparent pt-2 sm:pt-3 md:pt-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <CustomerHeader />
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <main className="w-full max-w-7xl mx-auto relative flex-1 px-2.5 sm:px-5 lg:px-8 pb-32 sm:pb-28 md:pb-20 pt-1.5 md:pt-3">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Outlet />
        </div>
      </main>

      {/* 3. FOOTER SPACING */}
      <footer className="h-6 md:h-8 pointer-events-none" />

      <style>{`
        :root { scroll-behavior: smooth; }
        body {
          background-color: #ffffff; 
          overscroll-behavior-y: none; 
          -webkit-font-smoothing: antialiased;
        }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
