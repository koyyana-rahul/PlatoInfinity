// src/layouts/AdminLayout.jsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";

import AdminHeader from "../components/headers/AdminHeader";
import AdminSidebar from "../components/sidebars/AdminSidebar";
import useMobile from "../hooks/useMobile";
import useAuthHydration from "../hooks/useAuthHydration";

export default function AdminLayout() {
  useAuthHydration();

  const user = useSelector((s) => s.user);
  const brand = useSelector((s) => s.brand);
  const location = useLocation();

  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        e.preventDefault();
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  /* ---------------- LOADING ---------------- */
  if (!user.isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="animate-spin h-10 w-10 border-4 border-[#FC8019] border-t-transparent rounded-full" />
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
    <div className="h-screen w-screen flex flex-col bg-[#FDFCFB] overflow-hidden">
      {/* HEADER */}
      <AdminHeader
        isSidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((prev) => !prev)}
      />

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        {/* SIDEBAR - Fixed on mobile, static on desktop */}
        <AdminSidebar
          open={!isMobile || sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* CONTENT - Full width on mobile when sidebar is closed */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FDFCFB] w-full min-w-0">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
