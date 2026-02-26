import { NavLink } from "react-router-dom";
import {
  FaChair,
  FaClipboardList,
  FaReceipt,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

import toast from "react-hot-toast";
import { useState } from "react";

import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";
import { logout } from "../../../store/auth/userSlice";

export default function WaiterSidebar({ open, onClose, brandSlug }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  const restaurantId = user?.restaurantId;

  const [loading, setLoading] = useState(false);

  // 🛑 SAFETY
  if (!brandSlug || !restaurantId) return null;

  const basePath = `/${brandSlug}/staff/waiter/restaurants/${restaurantId}`;

  const menu = [
    { name: "Tables", icon: FaChair, path: "" },
    { name: "Orders", icon: FaClipboardList, path: "orders" },
    { name: "Bills", icon: FaReceipt, path: "bills" },
    { name: "Call Alerts", icon: FaBell, path: "alerts" },
  ];

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={clsx(
          "fixed sm:static z-50 sm:z-0",
          "h-full w-[260px] sm:w-[280px] bg-white border-r border-gray-200 shadow-lg sm:shadow-none",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              Waiter Console
            </p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {menu.map(({ name, icon: Icon, path }) => (
              <NavLink
                key={name}
                to={`${basePath}/${path}`}
                end={path === ""}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-orange-50 to-orange-50/50 text-[#FC8019] shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="truncate">{name}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FC8019] flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* ================= SHIFT ACTION ================= */}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button
                onClick={async () => {
                  try {
                    if (loading) return;
                    setLoading(true);
                    await Axios(staffApi.endShift);
                    dispatch(logout());
                    toast.success("Shift ended");
                    navigate("/staff/login", { replace: true });
                  } catch (err) {
                    toast.error(
                      err?.response?.data?.message || "Failed to end shift",
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSignOutAlt size={16} />
                {loading ? "Ending..." : "End Shift"}
              </button>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
