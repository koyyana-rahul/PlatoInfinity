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
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900 antialiased font-sans">
      {/* 1. BRAND HEADER - Non-sticky to allow Category Bar to take over */}
      <div className="w-full bg-white">
        <div className="max-w-2xl mx-auto border-b border-slate-50">
          <CustomerHeader />
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-2xl mx-auto relative flex-1">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Outlet />
        </div>
      </main>

      {/* 3. FOOTER SPACING (Matches Cart Bar height) */}
      <footer className="h-32 pointer-events-none" />

      <style>{`
        :root { scroll-behavior: smooth; }
        body { 
          background-color: #ffffff; 
          overscroll-behavior-y: none; 
          -webkit-font-smoothing: antialiased;
        }
        /* Hide scrollbars for a clean app feel */
        ::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
