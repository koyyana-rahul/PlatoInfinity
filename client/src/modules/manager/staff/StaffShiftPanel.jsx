// src/modules/staff/StaffShiftPanel.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../api/axios";
import shiftApi from "../../api/shift.api";
import {
  FiClock,
  FiLogIn,
  FiLogOut,
  FiActivity,
  FiShield,
} from "react-icons/fi";
import clsx from "clsx";

export default function StaffShiftPanel({ user, refreshProfile }) {
  const [loading, setLoading] = useState(false);
  const onDuty = user?.onDuty;

  /* ===============================
      SHIFT ACTIONS
  =============================== */
  const handleShiftToggle = async (type) => {
    if (loading) return;
    const isStart = type === "start";

    try {
      setLoading(true);
      await Axios(isStart ? shiftApi.start : shiftApi.end);

      toast.success(isStart ? "Shift initialized" : "Shift completed");
      refreshProfile?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (isStart
          ? "Shift terminal unavailable. Contact manager."
          : "Failed to sync shift end.");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Background Decorative Accent */}
      <div
        className={clsx(
          "absolute -top-12 -right-12 w-32 h-32 blur-[60px] rounded-full transition-colors duration-1000",
          onDuty ? "bg-emerald-500/10" : "bg-slate-500/10",
        )}
      />

      {/* ---------- HEADER STATUS ---------- */}
      <div className="flex flex-col items-center text-center mb-8 relative z-10">
        <div
          className={clsx(
            "w-16 h-16 rounded-[24px] flex items-center justify-center mb-4 transition-all duration-500 shadow-sm border",
            onDuty
              ? "bg-emerald-50 border-emerald-100 text-emerald-600 ring-8 ring-emerald-500/5"
              : "bg-slate-50 border-slate-100 text-slate-400",
          )}
        >
          {onDuty ? (
            <FiActivity size={32} className="animate-pulse" />
          ) : (
            <FiClock size={32} />
          )}
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          {onDuty ? "Current Session Active" : "Authentication Required"}
        </h3>

        <div
          className={clsx(
            "mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
            onDuty
              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-slate-100 border-slate-200 text-slate-400",
          )}
        >
          {onDuty ? "On Duty" : "Off Duty"}
        </div>
      </div>

      {/* ---------- MAIN ACTION ---------- */}
      <div className="relative z-10">
        {onDuty ? (
          <button
            onClick={() => handleShiftToggle("end")}
            disabled={loading}
            className="group w-full h-14 bg-white border-2 border-red-50 text-red-500 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <>
                <FiLogOut size={16} /> End Shift
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => handleShiftToggle("start")}
            disabled={loading}
            className="group w-full h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiLogIn size={16} /> Initialize Shift
              </>
            )}
          </button>
        )}
      </div>

      {/* ---------- FOOTER INFO ---------- */}
      <div className="mt-6 flex items-center justify-center gap-2 text-slate-300">
        <FiShield size={12} />
        <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
          Secure Terminal v2.4
        </p>
      </div>

      <p className="mt-2 text-[9px] font-medium text-slate-400 text-center leading-relaxed">
        Attendance logging is synced with manager terminal. <br />
        Ensure your station is ready before initializing.
      </p>
    </div>
  );
}
