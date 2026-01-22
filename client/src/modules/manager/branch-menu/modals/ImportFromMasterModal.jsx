// src/modules/manager/branch-menu/modals/ImportFromMasterModal.jsx

import { useState } from "react";
import toast from "react-hot-toast";
import {
  X,
  CloudDownload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import Axios from "../../../../api/axios";

export default function ImportFromMasterModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await Axios.post(`/api/branch-menu/${restaurantId}/import`, {
        importAll: true,
        masterItemIds: [],
      });

      toast.success("Menu synchronized successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      {/* 1. HIGH-FIDELITY BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* 2. CENTERED MODAL CARD */}
      <div className="relative w-full max-w-[380px] bg-white rounded-[42px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* CLOSE ICON (Top Right) */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 active:scale-90 transition-all"
        >
          <X size={20} />
        </button>

        {/* CONTENT BODY */}
        <div className="p-10 flex flex-col items-center text-center">
          {/* ICON AREA */}
          <div className="relative mb-8 pt-4">
            {/* Ambient emerald glow */}
            <div className="absolute inset-0 bg-emerald-500/15 blur-3xl rounded-full" />

            <div className="relative w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[32px] flex items-center justify-center shadow-inner">
              <CloudDownload
                size={48}
                strokeWidth={1.5}
                className={clsx(loading && "animate-bounce")}
              />
            </div>

            {/* Micro Spinner Overlay */}
            <div className="absolute -bottom-1 -right-1 bg-white p-2.5 rounded-2xl shadow-xl text-emerald-600 border border-slate-50">
              <RefreshCw
                size={18}
                className={clsx(loading ? "animate-spin" : "opacity-30")}
              />
            </div>
          </div>

          {/* TYPOGRAPHY */}
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Sync Menu
          </h3>
          <p className="mt-4 text-[13px] font-medium text-slate-500 leading-relaxed px-2">
            Import all items, prices, and settings from the brand's master menu
            to this branch.
          </p>

          {/* TRUST PILLS */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
              <CheckCircle2 size={12} /> No Duplicates
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50">
              <CheckCircle2 size={12} /> Auto Sync
            </div>
          </div>

          {/* PRIMARY BUTTON */}
          <button
            onClick={submit}
            disabled={loading}
            className="
              mt-10 w-full h-14 bg-slate-900 text-white 
              rounded-3xl text-[11px] font-black uppercase tracking-[0.25em] 
              shadow-2xl shadow-slate-200 active:scale-95 transition-all 
              flex items-center justify-center gap-3
              disabled:opacity-50 hover:bg-emerald-600 group
            "
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} className="group-hover:animate-pulse" />
                Start Import
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
