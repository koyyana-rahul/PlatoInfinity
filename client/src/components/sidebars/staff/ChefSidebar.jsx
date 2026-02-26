// src/components/sidebars/ChefSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { FaFire, FaListAlt, FaClock, FaSignOutAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useState } from "react";

import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";
import { logout } from "../../../store/auth/userSlice";

export default function ChefSidebar({ open, onClose, brandSlug }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const restaurantId = useSelector((s) => s.user?.restaurantId);

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ================= SAFETY ================= */
  if (!brandSlug || !restaurantId) return null;

  const basePath = `/${brandSlug}/staff/chef/restaurants/${restaurantId}`;

  const menu = [
    { name: "Live Orders", icon: FaFire, path: "" },
    { name: "Queue", icon: FaListAlt, path: "queue" },
    { name: "History", icon: FaClock, path: "history" },
  ];

  /* ================= END SHIFT ================= */
  const handleConfirmEndShift = async () => {
    try {
      setLoading(true);

      await Axios(staffApi.endShift);

      dispatch(logout());
      toast.success("Shift ended successfully");

      navigate("/staff/login", { replace: true });
    } catch (err) {
      console.error("End shift error:", err);
      toast.error(err?.response?.data?.message || "Failed to end shift");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

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
              Chef Station
            </p>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* ================= MENU ================= */}
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
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300"
              >
                <FaSignOutAlt size={16} />
                End Shift
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* ================= CONFIRMATION MODAL ================= */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !loading && setShowConfirm(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 z-10">
            <h3 className="text-lg font-semibold text-gray-800">End Shift?</h3>

            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to end your shift? You will be logged out
              and won’t receive new orders.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="
                  px-4 py-2 rounded-lg text-sm
                  text-gray-700 hover:bg-gray-100
                  transition disabled:opacity-60
                "
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmEndShift}
                disabled={loading}
                className="
                  px-4 py-2 rounded-lg text-sm font-medium
                  bg-red-600 text-white
                  hover:bg-red-700 transition
                  disabled:opacity-60
                "
              >
                {loading ? "Ending..." : "End Shift"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
