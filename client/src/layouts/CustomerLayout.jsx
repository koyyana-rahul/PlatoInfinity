import { Outlet, Navigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import CustomerHeader from "../components/headers/CustomerHeader";
import Axios from "../api/axios";
import customerApi from "../api/customer.api";
import { setBrandDetails } from "../store/brand/brandSlice";
import { fetchCustomerOrders } from "../store/customer/orderThunks";
import "../styles/customer-mobile-refresh.css";

const resolveSessionIdFromStorage = (tableId) => {
  if (!tableId) return null;

  const sessionKey = `plato:customerSession:${tableId}`;
  const rawSession = localStorage.getItem(sessionKey);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession);
    return (
      parsed?.sessionId ||
      parsed?._id ||
      parsed?.id ||
      parsed?.session?.sessionId ||
      null
    );
  } catch {
    return rawSession;
  }
};

export default function CustomerLayout() {
  const { tableId } = useParams();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const dispatch = useDispatch();
  const brand = useSelector((s) => s.brand);

  if (!tableId) return <Navigate to="/" replace />;

  const [sessionId, setSessionId] = useState(() =>
    resolveSessionIdFromStorage(tableId),
  );

  useEffect(() => {
    setSessionId(resolveSessionIdFromStorage(tableId));

    // Some flows write session slightly after mount; retry briefly
    let tries = 0;
    const maxTries = 10;
    const interval = setInterval(() => {
      const resolved = resolveSessionIdFromStorage(tableId);
      if (resolved) {
        setSessionId(resolved);
        clearInterval(interval);
        return;
      }

      tries += 1;
      if (tries >= maxTries) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [tableId]);

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

  const pageTransition = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0, filter: "none" },
        animate: { opacity: 1, y: 0, filter: "none" },
        exit: { opacity: 1, y: 0, filter: "none" },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 18, filter: "blur(2px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -10, filter: "blur(1px)" },
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className="customer-shell min-h-screen flex flex-col bg-gradient-to-b from-[#fff7f2] via-white to-[#f8fafc] selection:bg-orange-100 selection:text-orange-900 antialiased font-sans text-slate-900">
      {/* 1. BRAND HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="block w-full bg-transparent pt-2 sm:pt-3 md:pt-4"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
          <CustomerHeader />
        </div>
      </motion.div>

      {/* 2. MAIN CONTENT AREA */}
      <main className="w-full max-w-7xl mx-auto relative flex-1 px-2.5 sm:px-5 lg:px-8 pb-4 sm:pb-6 md:pb-8 pt-2 md:pt-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} {...pageTransition}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. FOOTER SPACING */}
      <footer className="h-0 pointer-events-none" />

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
