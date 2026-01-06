import { NavLink, useParams } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUtensils,
  FaStore,
  FaUsers,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import clsx from "clsx";

export default function AdminSidebar({ open, onClose }) {
  const { brandSlug } = useParams();

  const menu = [
    { name: "Dashboard", icon: FaTachometerAlt, path: "dashboard" },
    { name: "Master Menu", icon: FaUtensils, path: "master-menu" },
    { name: "Restaurants", icon: FaStore, path: "restaurants" },
    // { name: "Managers", icon: FaUsers, path: "managers" },
    { name: "Reports", icon: FaChartBar, path: "reports" },
    { name: "Settings", icon: FaCog, path: "settings" },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-black/40 z-40 sm:hidden",
          open ? "block" : "hidden"
        )}
      />

      {/* SIDEBAR */}
      <aside
        className={clsx(
          "fixed sm:static z-50 sm:z-0 h-full w-64 bg-white border-r",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        <nav className="p-4 space-y-1">
          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={`/${brandSlug}/admin/${path}`}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-[#E6F4F1] text-[#00684A]"
                    : "text-gray-600 hover:bg-gray-100"
                )
              }
            >
              <Icon />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
