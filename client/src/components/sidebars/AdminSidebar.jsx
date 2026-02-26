// src/components/sidebars/AdminSidebar.jsx
import { NavLink, useParams } from "react-router-dom";
import {
  FiGrid,
  FiBookOpen,
  FiMapPin,
  FiPieChart,
  FiSettings,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";
import clsx from "clsx";

export default function AdminSidebar({ open, onClose }) {
  const { brandSlug } = useParams();

  const menu = [
    { name: "Dashboard", icon: FiGrid, path: "dashboard" },
    { name: "Master Menu", icon: FiBookOpen, path: "master-menu" },
    { name: "Restaurants", icon: FiMapPin, path: "restaurants" },
    { name: "Reports", icon: FiPieChart, path: "reports" },
    { name: "Settings", icon: FiSettings, path: "settings" },
  ];

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* ================= SIDEBAR CONTAINER ================= */}
      <aside
        className={clsx(
          "fixed lg:static z-50 lg:z-0 h-screen w-[280px] sm:w-[300px] bg-white flex flex-col transition-transform duration-300 ease-out border-r border-gray-200 shadow-lg lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* BRANDING HEADER */}
        <div className="h-16 sm:h-20 flex items-center px-4 sm:px-6 gap-3 shrink-0 border-b border-gray-100">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-xl flex items-center justify-center shadow-md">
            <FiShield
              className="text-white text-base sm:text-lg"
              strokeWidth={2.5}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              Plato Admin
            </span>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider truncate">
              Management Portal
            </span>
          </div>
        </div>

        {/* NAVIGATION AREA */}
        <nav className="flex-1 px-3 sm:px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <p className="px-3 mb-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </p>

          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={`/${brandSlug}/admin/${path}`}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-orange-50 to-orange-50/50 text-[#FC8019] shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="flex-shrink-0"
                  />
                  <span className="truncate">{name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FC8019] flex-shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
