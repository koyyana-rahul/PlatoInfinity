import { useState } from "react";
import toast from "react-hot-toast";
import { Power, LayoutPanelTop, Activity, Loader2 } from "lucide-react";
import Axios from "../../../api/axios";
import kitchenStationApi from "../../../api/kitchenStation.api";
import clsx from "clsx";

export default function KitchenStationList({ stations, onUpdate }) {
  // Track loading state per station ID to prevent concurrent clicks
  const [processingId, setProcessingId] = useState(null);

  /* ---------------- PREMIUM EMPTY STATE ---------------- */
  if (!stations.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-6 text-center bg-white border border-dashed border-slate-200 rounded-[32px] sm:rounded-[40px] animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-600 rounded-[24px] sm:rounded-[32px] flex items-center justify-center shadow-sm">
            <LayoutPanelTop size={32} strokeWidth={1.5} className="sm:hidden" />
            <LayoutPanelTop
              size={40}
              strokeWidth={1.5}
              className="hidden sm:block"
            />
          </div>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          No Stations Yet
        </h3>
        <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400 max-w-[260px] leading-relaxed">
          Create stations like{" "}
          <span className="text-emerald-600 font-bold">Grill</span> or{" "}
          <span className="text-emerald-600 font-bold">Pizza Oven</span> to
          start routing orders.
        </p>
      </div>
    );
  }

  const toggleStation = async (station) => {
    if (processingId) return; // Prevent spamming

    try {
      setProcessingId(station._id);
      const isEnabling = station.isArchived;
      const endpoint = isEnabling
        ? kitchenStationApi.enable
        : kitchenStationApi.disable;

      await Axios(endpoint(station._id));

      toast.success(`Station ${isEnabling ? "Online" : "Offline"}`);
      onUpdate(station._id, { isArchived: !isEnabling });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {stations.map((s) => {
        const isProcessing = processingId === s._id;

        return (
          <div
            key={s._id}
            className={clsx(
              "group relative p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] border transition-all duration-500",
              s.isArchived
                ? "bg-slate-50/50 border-slate-100 grayscale opacity-80"
                : "bg-white border-slate-100 hover:border-emerald-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]",
            )}
          >
            {/* STATUS HEADER */}
            <div className="flex justify-between items-start mb-6">
              <div
                className={clsx(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                  s.isArchived
                    ? "bg-slate-200 text-slate-400"
                    : "bg-emerald-50 text-emerald-500",
                )}
              >
                <LayoutPanelTop size={20} className="sm:hidden" />
                <LayoutPanelTop size={24} className="hidden sm:block" />
              </div>

              <div
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all",
                  s.isArchived
                    ? "bg-slate-100 border-slate-200 text-slate-400"
                    : "bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]",
                )}
              >
                <div
                  className={clsx(
                    "w-1 h-1 rounded-full",
                    s.isArchived ? "bg-slate-400" : "bg-white animate-pulse",
                  )}
                />
                {s.isArchived ? "Offline" : "Online"}
              </div>
            </div>

            {/* STATION INFO */}
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none truncate">
                {s.name}
              </h4>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Kitchen Unit
              </p>
            </div>

            {/* ACTION BUTTON */}
            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => toggleStation(s)}
                disabled={isProcessing}
                className={clsx(
                  "w-full h-11 sm:h-12 flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm disabled:opacity-50",
                  s.isArchived
                    ? "bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-200"
                    : "bg-white border border-red-100 text-red-500 hover:bg-red-50",
                )}
              >
                {isProcessing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Power size={14} />
                )}
                {s.isArchived ? "Go Online" : "Shutdown"}
              </button>
            </div>

            {/* DECORATIVE BACKGROUND ICON */}
            {!s.isArchived && (
              <div className="absolute -bottom-2 -right-2 text-emerald-500/[0.03] rotate-12 transition-transform group-hover:scale-110 duration-700 pointer-events-none">
                <Activity size={70} className="sm:w-[80px] sm:h-[80px]" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
