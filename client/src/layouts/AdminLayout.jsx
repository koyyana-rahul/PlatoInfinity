// src/layouts/AdminLayout.jsx
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import AdminHeader from "../components/headers/AdminHeader";
import AdminSidebar from "../components/sidebars/AdminSidebar";
import useMobile from "../hooks/useMobile";
import useAuthHydration from "../hooks/useAuthHydration";

export default function AdminLayout() {
  useAuthHydration();

  const user = useSelector((s) => s.user);
  const brand = useSelector((s) => s.brand);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#FDFCFB] w-full min-w-0 custom-scrollbar scroll-smooth">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                {...routeTransition}
                className="max-w-7xl mx-auto w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
