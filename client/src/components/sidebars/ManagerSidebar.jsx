import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUtensils,
  FaUsers,
  FaChair,
  FaChartBar,
  FaCog,
  FaFire,
  FaQrcode,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import clsx from "clsx";

export default function ManagerSidebar({ open, onClose }) {
  const user = useSelector((s) => s.user);
  const brandSlug = user?.brand?.slug;
  const restaurantId = user?.restaurantId;

  if (!brandSlug || !restaurantId) return null;

  const basePath = `/${brandSlug}/manager/restaurants/${restaurantId}`;

  const menu = [
    { name: "Dashboard", icon: FaTachometerAlt, path: "dashboard" },
    { name: "Food Menu", icon: FaUtensils, path: "menu" },
    { name: "Kitchen Hub", icon: FaFire, path: "kitchen-stations" },
    { name: "Staff Team", icon: FaUsers, path: "staff" },
    { name: "Staff QR Access", icon: FaQrcode, path: "staff-qr" },
    { name: "Table Management", icon: FaChair, path: "tables" },
    { name: "Business Analytics", icon: FaChartBar, path: "reports" },
    { name: "Global Settings", icon: FaCog, path: "settings" },
  ];

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-slate-900/10 backdrop-blur-md z-40 lg:hidden transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* ================= SIDEBAR CONTAINER ================= */}
      <aside
        className={clsx(
          "fixed lg:static z-50 lg:z-0",
          "h-[calc(100dvh-64px)] w-[290px] bg-white border-r border-slate-100",
          "transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full py-8 px-5">
          {/* Section Heading: Extra Tracking for Premium Feel */}
          <p className="px-4 text-[11px] uppercase tracking-[0.2em] font-black text-slate-300 mb-6">
            Management
          </p>

          <nav className="space-y-2 overflow-y-auto hide-scrollbar flex-1">
            {menu.map(({ name, icon: Icon, path }) => (
              <NavLink
                key={name}
                to={`${basePath}/${path}`}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  clsx(
                    "group relative flex items-center gap-4 px-4 py-3.5 rounded-[18px] text-sm font-bold transition-all duration-300 active:scale-95",
                    isActive
                      ? "bg-emerald-50 text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                  )
                }
              >
                {/* Active Indicator Pillar: Vertical Bar */}
                <div
                  className={clsx(
                    "absolute left-0 w-1 h-6 rounded-r-full bg-emerald-500 transition-all duration-500 scale-y-0 origin-center",
                    "group-[.active]:scale-y-100",
                  )}
                />

                <Icon
                  className={clsx(
                    "text-lg transition-transform duration-500 group-hover:scale-110",
                    "group-[.active]:text-emerald-500",
                  )}
                />

                <span className="truncate tracking-tight">{name}</span>

                {/* Subtle Glow interaction */}
                <div className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-emerald-500/[0.03] to-transparent pointer-events-none" />
              </NavLink>
            ))}
          </nav>

          {/* Bottom Branding: Sophisticated Card */}
          <div className="mt-auto pt-6 border-t border-slate-50">
            <div className="px-4 py-4 rounded-[22px] bg-slate-50/50 border border-slate-100 flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/20">
                  {user?.brand?.name?.charAt(0) || "M"}
                </div>
                {/* Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
              </div>

              <div className="truncate">
                <p className="text-xs font-black text-slate-900 truncate">
                  {user?.brand?.name}
                </p>
                <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-tighter">
                  Verified Manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Modern Apple-style easing */
        .cubic-bezier {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `,
        }}
      />
    </>
  );
}
