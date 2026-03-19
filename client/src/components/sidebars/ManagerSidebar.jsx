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
    { name: "Kitchen Hub", icon: FaFire, path: "kitchen-stations" },
    { name: "Staff Team", icon: FaUsers, path: "staff" },
    { name: "Food Menu", icon: FaUtensils, path: "menu" },
    { name: "Table Management", icon: FaChair, path: "tables" },

    { name: "Staff QR Access", icon: FaQrcode, path: "staff-qr" },

    { name: "Business Analytics", icon: FaChartBar, path: "reports" },
    { name: "Global Settings", icon: FaCog, path: "settings" },
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
          "fixed lg:static z-50 lg:z-0",
          "h-screen w-[280px] sm:w-[300px] bg-white border-r border-gray-200 shadow-lg lg:shadow-none",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Section Heading */}
          <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-gray-100">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
              Management
            </p>
          </div>

          <nav className="flex-1 px-3 sm:px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {menu.map(({ name, icon: Icon, path }) => (
              <NavLink
                key={name}
                to={`${basePath}/${path}`}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
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
                      className={clsx(
                        "text-base sm:text-lg flex-shrink-0",
                        isActive ? "text-[#FC8019]" : "text-gray-500",
                      )}
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

          {/* Bottom Branding */}
          <div className="p-3 sm:p-4 border-t border-gray-100">
            <div className="px-3 sm:px-4 py-3 sm:py-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 flex items-center gap-3 shadow-sm">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FC8019] to-[#FF6B35] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user?.brand?.name?.charAt(0) || "M"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {user?.brand?.name}
                </p>
                <p className="text-[10px] font-medium text-gray-500 truncate">
                  Manager Portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
