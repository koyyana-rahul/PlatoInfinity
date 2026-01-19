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
        <nav className="p-3 space-y-1">
          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={`${basePath}/${path}`}
              end={path === ""}
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

          {/* ================= SHIFT ACTION ================= */}
          <div className="pt-4 mt-4 border-t">
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
                  toast.error(err?.response?.data?.message || "Failed to end shift");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="
                w-full flex items-center gap-3 px-3 py-2.5
                rounded-lg text-sm font-medium text-red-600
                hover:bg-red-50 transition disabled:opacity-60
              "
            >
              <FaSignOutAlt size={16} />
              {loading ? "Ending..." : "End Shift"}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
