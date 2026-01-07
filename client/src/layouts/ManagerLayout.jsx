import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

// import ManagerHeader from "../components/headers/ManagerHeader";
// import ManagerSidebar from "../components/sidebars/ManagerSidebar";

import useMobile from "../hooks/useMobile";
import useAuthHydration from "../hooks/useAuthHydration";
import AdminHeader from "../components/headers/AdminHeader";
import ManagerSidebar from "../components/sidebars/ManagerSidebar";

export default function ManagerLayout() {
  useAuthHydration();

  const user = useSelector((s) => s.user);
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ---------------- LOADING ---------------- */
  if (!user.isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FBFA]">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ---------------- AUTH ---------------- */
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "MANAGER") {
    return <Navigate to="/redirect" replace />;
  }

  /* ---------------- LAYOUT ---------------- */
  return (
    <div className="h-screen flex flex-col bg-[#F9FBFA] overflow-hidden">
      {/* HEADER (FULL WIDTH) */}
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <ManagerSidebar
          open={!isMobile || sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
