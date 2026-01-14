import { Outlet, Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

import AdminHeader from "../components/headers/AdminHeader";
import WaiterSidebar from "../components/sidebars/staff/WaiterSidebar";
import ChefSidebar from "../components/sidebars/staff/ChefSidebar";
import CashierSidebar from "../components/sidebars/staff/CashierSidebar";
import useMobile from "../hooks/useMobile";
import useAuthHydration from "../hooks/useAuthHydration";

export default function StaffLayout() {
  useAuthHydration();

  const user = useSelector((s) => s.user);
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { brandSlug } = useParams();

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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
