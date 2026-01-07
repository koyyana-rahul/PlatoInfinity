import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUtensils,
  FaUsers,
  FaChair,
  FaChartBar,
  FaCog,
  FaFire, // 🔥 Kitchen icon
} from "react-icons/fa";
import { useSelector } from "react-redux";
import clsx from "clsx";

export default function ManagerSidebar({ open, onClose }) {
  const user = useSelector((s) => s.user);

  const brandSlug = user?.brand?.slug;
  const restaurantId = user?.restaurantId;

  // 🛑 Safety: avoid broken routes
  if (!brandSlug || !restaurantId) return null;

  const basePath = `/${brandSlug}/manager/restaurants/${restaurantId}`;

  const menu = [
    { name: "Dashboard", icon: FaTachometerAlt, path: "dashboard" },
    { name: "Menu", icon: FaUtensils, path: "menu" },

    // ✅ NEW: Kitchen Stations
    {
      name: "Kitchen Stations",
      icon: FaFire,
      path: "kitchen-stations",
    },

    { name: "Staff", icon: FaUsers, path: "staff" },
    { name: "Tables", icon: FaChair, path: "tables" },
    { name: "Reports", icon: FaChartBar, path: "reports" },
    { name: "Settings", icon: FaCog, path: "settings" },
  ];

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-black/40 z-40 sm:hidden transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={clsx(
          "fixed sm:static z-50 sm:z-0",
          "h-full w-64 bg-white border-r",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        {/* ================= CONTEXT ================= */}
        {/* <div className="px-4 py-4 border-b">
          <p className="text-xs text-gray-500">Managing restaurant</p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {restaurantId}
          </p>
        </div> */}

        {/* ================= NAV ================= */}
        <nav className="p-3 space-y-1">
          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={`${basePath}/${path}`}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-700 hover:bg-gray-100"
                )
              }
            >
              <Icon size={16} />
              <span className="truncate">{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
