// src/modules/manager/branch-menu/modals/SyncWithMasterModal.jsx

import { useState } from "react";
import toast from "react-hot-toast";
import { X, RefreshCcw, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import clsx from "clsx";

import Axios from "../../../../api/axios";
import branchMenuApi from "../../../../api/branchMenu.api";

export default function SyncWithMasterModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [overwrite, setOverwrite] = useState(false);
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    try {
      setLoading(true);
      await Axios({
        ...branchMenuApi.syncWithMaster(restaurantId),
        data: { overwrite },
      });

      toast.success("Menu synchronized with master");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      {/* 1. GLASS BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* 2. CENTERED MODAL CARD */}
      <div className="relative w-full max-w-[400px] bg-white rounded-[42px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 active:scale-90 transition-all"
        >
          <X size={20} />
        </button>

        <div className="p-10 flex flex-col items-center text-center">
          {/* ICON AREA */}
          <div className="relative mb-6 pt-2">
            <div
              className={clsx(
                "absolute inset-0 blur-3xl rounded-full transition-colors duration-500",
                overwrite ? "bg-amber-500/20" : "bg-emerald-500/20",
              )}
            />

            <div
              className={clsx(
                "relative w-20 h-20 rounded-[28px] flex items-center justify-center transition-all duration-500",
                overwrite
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              <RefreshCcw
                size={40}
                strokeWidth={1.5}
                className={clsx(loading && "animate-spin")}
              />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Sync Menu
          </h3>
          <p className="mt-3 text-[13px] font-medium text-slate-500 leading-relaxed">
            Update your branch menu with the latest global changes from the
            Master Menu.
          </p>

          {/* OVERWRITE TOGGLE CARD */}
          <div
            onClick={() => setOverwrite(!overwrite)}
            className={clsx(
              "mt-8 w-full p-4 rounded-3xl border transition-all duration-300 cursor-pointer group",
              overwrite
                ? "bg-amber-50/50 border-amber-200"
                : "bg-slate-50 border-slate-100 hover:border-slate-200",
            )}
          >
            <div className="flex items-start gap-3 text-left">
              <div
                className={clsx(
                  "mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                  overwrite
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-white border-slate-300",
                )}
              >
                {overwrite && (
                  <Zap size={12} strokeWidth={4} fill="currentColor" />
                )}
              </div>
              <div>
                <p
                  className={clsx(
                    "text-[13px] font-black leading-none transition-colors",
                    overwrite ? "text-amber-700" : "text-slate-700",
                  )}
                >
                  Overwrite Local Changes
                </p>
                <p className="text-[10px] font-medium text-slate-400 mt-1.5 leading-tight">
                  Reset local names, prices, and stations to match the master
                  menu values.
                </p>
              </div>
            </div>
          </div>

          {/* WARNING LABEL (Only shows when Overwrite is off) */}
          {!overwrite && (
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 size={14} /> Preserving Local Edits
            </div>
          )}

          {/* SYNC ACTION BUTTON */}
          <button
            onClick={sync}
            disabled={loading}
            className={clsx(
              "mt-8 w-full h-14 rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50",
              overwrite
                ? "bg-amber-600 text-white shadow-amber-200 hover:bg-amber-700"
                : "bg-slate-900 text-white shadow-slate-200 hover:bg-emerald-600",
            )}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {overwrite ? (
                  <AlertTriangle size={16} />
                ) : (
                  <RefreshCcw size={16} />
                )}
                {overwrite ? "Confirm Overwrite" : "Sync Now"}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
