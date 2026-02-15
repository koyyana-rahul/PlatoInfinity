import { Outlet, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomerHeader from "../components/headers/CustomerHeader";
import Axios from "../api/axios";
import customerApi from "../api/customer.api";
import { setBrandDetails } from "../store/brand/brandSlice";
import { fetchCustomerOrders } from "../store/customer/orderThunks";
import MobileBottomNav from "../modules/customer/components/MobileBottomNav";

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
    <div className="min-h-screen bg-[#f8f8f7] selection:bg-orange-100 selection:text-orange-900 antialiased font-sans">
      {/* 1. BRAND HEADER - Desktop/Tablet only */}
      <div className="hidden md:block w-full bg-transparent pt-5">
        <div className="max-w-6xl mx-auto px-6">
          <CustomerHeader />
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto relative flex-1 px-4 sm:px-6 lg:px-8 pb-36 md:pb-20 pt-2 md:pt-4">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Outlet />
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAV */}
      <MobileBottomNav />

      {/* 4. FOOTER SPACING */}
      <footer className="h-24 md:h-12 pointer-events-none" />

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
