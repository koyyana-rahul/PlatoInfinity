// src/modules/staff/StaffShiftPanel.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../api/axios";
import shiftApi from "../../api/shift.api";
import { FiClock, FiLogIn, FiLogOut } from "react-icons/fi";
import clsx from "clsx";

export default function StaffShiftPanel({ user, refreshProfile }) {
  const [loading, setLoading] = useState(false);
  const onDuty = user?.onDuty;

  /* ===============================
     START SHIFT
  =============================== */
  const startShift = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await Axios(shiftApi.start);

      toast.success("Shift started");
      refreshProfile?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Shift not available. Ask manager to open shift.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     END SHIFT
  =============================== */
  const endShift = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await Axios(shiftApi.end);

      toast.success("Shift ended");
      refreshProfile?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Unable to end shift";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
      {/* ---------- STATUS ---------- */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "w-3 h-3 rounded-full",
            onDuty ? "bg-emerald-500" : "bg-gray-400"
          )}
        />
        <div className="flex items-center gap-2 text-gray-700">
          <FiClock />
          <span className="font-medium">
            Shift Status:{" "}
            <span
              className={clsx(
                "font-semibold",
                onDuty ? "text-emerald-600" : "text-gray-500"
              )}
            >
              {onDuty ? "ON DUTY" : "OFF DUTY"}
            </span>
          </span>
        </div>
      </div>

      {/* ---------- ACTION ---------- */}
      {onDuty ? (
        <button
          onClick={endShift}
          disabled={loading}
          className={clsx(
            "w-full py-3 rounded-xl flex items-center justify-center gap-2",
            "text-white font-medium transition",
            loading
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          )}
        >
          <FiLogOut />
          {loading ? "Ending Shift..." : "End Shift"}
        </button>
      ) : (
        <button
          onClick={startShift}
          disabled={loading}
          className={clsx(
            "w-full py-3 rounded-xl flex items-center justify-center gap-2",
            "text-white font-medium transition",
            loading
              ? "bg-emerald-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700"
          )}
        >
          <FiLogIn />
          {loading ? "Starting Shift..." : "Start Shift"}
        </button>
      )}

      {/* ---------- FOOTER INFO ---------- */}
      <p className="text-xs text-gray-400 text-center">
        Shift access depends on manager opening the shift
      </p>
    </div>
  );
}
