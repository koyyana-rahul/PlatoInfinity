import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";

import AdminHeader from "../components/headers/AdminHeader";
import AdminSidebar from "../components/sidebars/AdminSidebar";
import useMobile from "../hooks/useMobile";
import useAuthHydration from "../hooks/useAuthHydration";

export default function AdminLayout() {
  useAuthHydration();

  const user = useSelector((s) => s.user);
  const brand = useSelector((s) => s.brand);

  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ---------------- LOADING ---------------- */
  if (!user.isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FBFA]">
        <div className="animate-spin h-10 w-10 border-4 border-[#00684A] border-t-transparent rounded-full" />
      </div>
    );
  }

  /* ---------------- AUTH ---------------- */
  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!brand.slug) {
    return <Navigate to="/onboarding/create-brand" replace />;
  }

  /* ---------------- LAYOUT ---------------- */
  return (
    <div className="h-screen flex flex-col bg-[#F9FBFA] overflow-hidden">
      {/* HEADER (ALWAYS FULL WIDTH) */}
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <AdminSidebar
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
