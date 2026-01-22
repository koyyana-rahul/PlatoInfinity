import { useEffect, useState, useMemo } from "react";
import Axios from "../../../api/axios";
import shiftApi from "../../../api/shift.api";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  FiCopy,
  FiRefreshCw,
  FiPower,
  FiClock,
  FiActivity,
  FiShield,
  FiPrinter,
} from "react-icons/fi";

export default function ShiftQrPanel() {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  /* ================= LOAD ACTIVE SHIFT ================= */
  const loadActiveShift = async () => {
    try {
      const res = await Axios(shiftApi.active);
      setShift(res.data?.data || null);
    } catch {
      setShift(null);
    }
  };

  useEffect(() => {
    loadActiveShift();
  }, []);

  /* ================= LIVE TIMER ================= */
  useEffect(() => {
    if (!shift?.qrExpiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [shift?.qrExpiresAt]);

  const openShift = async () => {
    try {
      setLoading(true);
      const res = await Axios({ ...shiftApi.open, data: { openedCash: 0 } });
      setShift(res.data.data);
      toast.success("Shift Terminal Activated");
    } catch (err) {
      toast.error("Shift activation failed");
    } finally {
      setLoading(false);
    }
  };

  const refreshQr = async () => {
    try {
      const res = await Axios(shiftApi.refreshQr);
      setShift(res.data.data);
      toast.success("Security token refreshed");
    } catch {
      toast.error("Refresh failed");
    }
  };

  const closeShift = async () => {
    try {
      await Axios(shiftApi.close);
      setShift(null);
      toast.success("Shift terminated");
    } catch {
      toast.error("Termination failed");
    }
  };

  const qrValue = useMemo(() => {
    if (!shift?.qrToken) return "";
    return `${window.location.origin}/staff/login?token=${shift.qrToken}`;
  }, [shift?.qrToken]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      toast.success("Link secured");
    } catch {
      toast.error("Copy failed");
    }
  };

  /* ================= CALCS ================= */
  const expiresMs = shift ? new Date(shift.qrExpiresAt).getTime() - now : 0;
  const expiresInMin = Math.max(0, Math.floor(expiresMs / 60000));
  const expiresInSec = Math.max(0, Math.floor((expiresMs % 60000) / 1000));
  const isExpiringSoon = expiresInMin < 2;

  /* ================= UI STATES ================= */
  if (!shift) {
    return (
      <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-10 max-w-[400px] text-center animate-in fade-in zoom-in-95 duration-500 mx-auto">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 text-slate-300">
          <FiPower size={32} className="sm:w-[40px] sm:h-[40px]" />
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
          Terminal Inactive
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-400 mt-2 leading-relaxed">
          The registration portal is currently locked. Open a shift to begin
          staff authentication.
        </p>

        <button
          onClick={openShift}
          disabled={loading}
          className="mt-8 w-full py-3.5 sm:py-4 bg-slate-900 text-white rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200"
        >
          {loading ? "INITIALIZING..." : "START SYSTEM SHIFT"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 p-5 sm:p-10 w-full max-w-[440px] relative overflow-hidden animate-in slide-in-from-bottom-6 duration-700 mx-auto">
      {/* Background Warning Glow */}
      <div
        className={clsx(
          "absolute -top-24 -right-24 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000",
          isExpiringSoon ? "bg-red-500/10" : "bg-emerald-500/5",
        )}
      />

      {/* ---------- HEADER ---------- */}
      <div className="flex items-start justify-between mb-5 sm:mb-8 relative z-10">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-emerald-600">
            <FiShield size={14} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none">
              Active Terminal
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff Access
          </h3>
        </div>

        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-500",
            isExpiringSoon
              ? "bg-red-50 border-red-100 text-red-600"
              : "bg-emerald-50 border-emerald-100 text-emerald-700",
          )}
        >
          <FiClock
            size={12}
            className={clsx(isExpiringSoon && "animate-pulse")}
          />
          <span className="text-[10px] sm:text-[11px] font-black tabular-nums">
            {expiresInMin}:{expiresInSec.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ---------- QR CANVAS ---------- */}
      <div className="relative group z-10">
        <div className="relative flex justify-center bg-white border border-slate-100 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-inner overflow-hidden">
          <div className="absolute inset-0 border-2 border-emerald-500/10 rounded-[24px] sm:rounded-[32px] animate-pulse pointer-events-none" />

          <QRCode
            value={qrValue}
            size={160}
            level="H"
            className="rounded-lg w-full max-w-[200px] h-auto"
            fgColor="#0f172a"
          />
        </div>
      </div>

      {/* ---------- LINK ACTION ---------- */}
      <div className="mt-5 sm:mt-8 space-y-1.5 relative z-10">
        <div className="flex justify-between items-center px-1">
          <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Link{" "}
            <FiActivity size={10} className="animate-pulse text-emerald-400" />
          </label>
          <button
            onClick={copyLink}
            className="text-[9px] font-bold text-emerald-600 uppercase flex items-center gap-1 hover:underline"
          >
            <FiCopy size={10} /> Copy Link
          </button>
        </div>
        <div className="h-10 sm:h-12 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl px-4 flex items-center overflow-hidden">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate tracking-tight">
            {qrValue}
          </span>
        </div>
      </div>

      {/* ---------- FOOTER ACTIONS ---------- */}
      <div className="grid grid-cols-2 gap-3 mt-6 sm:mt-8 pt-2 relative z-10">
        <button
          onClick={refreshQr}
          className="h-11 sm:h-14 flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <FiRefreshCw size={14} /> REFRESH
        </button>

        <button
          onClick={closeShift}
          className="h-11 sm:h-14 flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-red-50 text-red-600 text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm"
        >
          <FiPower size={14} /> CLOSE SHIFT
        </button>
      </div>

      <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 text-center mt-5 sm:mt-8 tracking-widest opacity-80 uppercase">
        Enclosure Security Level 4
      </p>
    </div>
  );
}
