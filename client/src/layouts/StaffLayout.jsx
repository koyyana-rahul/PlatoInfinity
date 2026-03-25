import { Outlet, Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import AdminHeader from "../components/headers/AdminHeader";
import WaiterSidebar from "../components/sidebars/staff/WaiterSidebar";
import ChefSidebar from "../components/sidebars/staff/ChefSidebar";
import CashierSidebar from "../components/sidebars/staff/CashierSidebar";
import useMobile from "../hooks/useMobile";
import useAuthHydration from "../hooks/useAuthHydration";

export default function StaffLayout() {
  useAuthHydration();

  const user = useSelector((s) => s.user);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { brandSlug } = useParams();

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  const routeTransition = prefersReducedMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      };

  if (!user.isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user.isAuthenticated) {
    return <Navigate to="/staff/login" replace />;
  }

  if (!["WAITER", "CHEF", "CASHIER"].includes(user.role)) {
    return <Navigate to="/redirect" replace />;
  }

  const Sidebar =
    user.role === "WAITER"
      ? WaiterSidebar
      : user.role === "CHEF"
      ? ChefSidebar
      : CashierSidebar;

  return (
    <div className="h-screen flex flex-col bg-[#F9FBFA] overflow-hidden">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={!isMobile || sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          brandSlug={brandSlug}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 pb-5 sm:pb-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} {...routeTransition}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
