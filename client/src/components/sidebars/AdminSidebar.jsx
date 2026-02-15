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
          "fixed inset-0 bg-slate-900/35 backdrop-blur-md z-40 lg:hidden transition-opacity duration-500",
          open ? "opacity-100 block" : "opacity-0 hidden",
        )}
      />

      {/* ================= SIDEBAR CONTAINER ================= */}
      <aside
        className={clsx(
          "fixed lg:static z-50 lg:z-0 h-screen w-[290px] bg-[#FCFCFC] flex flex-col transition-all duration-500 ease-in-out shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]",
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* BRANDING HEADER */}
        <div className="h-24 flex items-center px-6 gap-3 shrink-0">
          <div className="w-11 h-11 bg-[#F35C2B] rounded-2xl flex items-center justify-center shadow-[0_20px_25px_-5px_rgb(243_92_43_/_0.35)]">
            <FiShield className="text-white text-lg" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight uppercase leading-none">
              Plato Admin
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] mt-1">
              Enterprise Hub
            </span>
          </div>
        </div>

        {/* NAVIGATION AREA */}
        <nav className="flex-1 px-4 pb-5 pt-2 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="px-3 mb-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Management
          </p>

          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={`/${brandSlug}/admin/${path}`}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "group flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95",
                  isActive
                    ? "bg-white text-[#F35C2B] shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)]"
                    : "text-slate-500 hover:bg-white hover:text-slate-900 hover:scale-[1.02]",
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
                          ? "text-[#F35C2B]"
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
                        ? "opacity-100 translate-x-0 text-[#F35C2B]/70"
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* PROFILE FOOTER */}
        <div className="p-4 shrink-0">
          <div className="bg-white rounded-3xl p-4 flex items-center gap-3 shadow-[0_20px_25px_-5px_rgb(0_0_0_/_0.05)] hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F35C2B] to-[#ff8c66] flex items-center justify-center font-black text-white text-xs shadow-inner">
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
