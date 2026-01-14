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
          {/* ================= MENU ================= */}
          {menu.map(({ name, icon: Icon, path }) => (
            <NavLink
              key={name}
              to={`${basePath}/${path}`}
              end={path === ""}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                  "text-sm font-medium transition",
                  isActive
                    ? "bg-orange-50 text-orange-700"
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
              onClick={() => setShowConfirm(true)}
              className="
                w-full flex items-center gap-3 px-3 py-2.5
                rounded-lg text-sm font-medium text-red-600
                hover:bg-red-50 transition
              "
            >
              <FaSignOutAlt size={16} />
              End Shift
            </button>
          </div>
        </nav>
      </aside>

      {/* ================= CONFIRMATION MODAL ================= */}
      {showConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
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
