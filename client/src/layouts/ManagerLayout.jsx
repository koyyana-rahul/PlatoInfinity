import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import useMobile from "../hooks/useMobile";
import useAuthHydration from "../hooks/useAuthHydration";
import AdminHeader from "../components/headers/AdminHeader";
import ManagerSidebar from "../components/sidebars/ManagerSidebar";

export default function ManagerLayout() {
  useAuthHydration();
  const user = useSelector((s) => s.user);
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync: Close sidebar if we resize to desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  /* ---------------- PREMIUM LOADING ---------------- */
  if (!user.isHydrated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="h-12 w-12 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Loading Portal
        </p>
      </div>
    );
  }

  if (!user.isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== "MANAGER") return <Navigate to="/redirect" replace />;

  return (
    <div className="h-screen flex flex-col bg-[#F8FAF9] overflow-hidden">
      {/* HEADER: High Z-Index so it stays above the dimming overlay */}
      <div className="relative z-[130] bg-white">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* MOBILE OVERLAY: Dims content but NOT the header */}
        {isMobile && (
          <div
            className={`
              fixed inset-0 top-[80px] z-[110] bg-slate-900/10 backdrop-blur-sm 
              transition-opacity duration-500 ease-in-out
              ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR: Highest Layer */}
        <div
          className={`
          fixed lg:relative z-[140] lg:z-10 h-full
          transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <ManagerSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#F8FAF9]">
          <div className="max-w-[1600px] mx-auto p-4 sm:p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </main>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `,
        }}
      />
    </div>
  );
}
