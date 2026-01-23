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
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-500",
          open ? "opacity-100 block" : "opacity-0 hidden",
        )}
      />

      {/* ================= SIDEBAR CONTAINER ================= */}
      <aside
        className={clsx(
          "fixed sm:static z-50 sm:z-0 h-screen w-72 bg-white border-r border-slate-100 flex flex-col transition-all duration-500 ease-in-out",
          open
            ? "translate-x-0 shadow-2xl sm:shadow-none"
            : "-translate-x-full sm:translate-x-0",
        )}
      >
        {/* BRANDING HEADER */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-50 shrink-0">
          <div className="w-10 h-10 bg-emerald-600 rounded-[12px] flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <FiShield className="text-white text-lg" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none">
              Plato Admin
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Enterprise Hub
            </span>
          </div>
        </div>

        {/* NAVIGATION AREA */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 mb-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Management
          </p>

          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={`/${brandSlug}/admin/${path}`}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                )
              }
            >
              {/* ✅ THE FIX: isActive is now correctly scoped within this function */}
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={clsx(
                        "transition-colors",
                        isActive
                          ? "text-emerald-600"
                          : "text-slate-400 group-hover:text-slate-600",
                      )}
                    />
                    <span className="tracking-tight">{name}</span>
                  </div>

                  <FiChevronRight
                    size={14}
                    className={clsx(
                      "transition-all duration-300",
                      isActive
                        ? "opacity-100 translate-x-0 text-emerald-400"
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* PROFILE FOOTER */}
        <div className="p-4 border-t border-slate-50 shrink-0">
          <div className="bg-slate-50/50 rounded-2xl p-3 flex items-center gap-3 border border-slate-100/50 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-white text-xs shadow-inner">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate tracking-tight">
                John Doe
              </p>
              <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-wide">
                Brand Manager
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
