// src/modules/manager/staff/modals/RegeneratePinModal.jsx
import { Key, X, AlertTriangle } from "lucide-react";
import clsx from "clsx";

export default function RegeneratePinModal({
  staff,
  loading,
  onConfirm,
  onClose,
}) {
  if (!staff) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
      {/* 1. GLASS BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* 2. MODAL CARD */}
      <div className="relative bg-white w-full max-w-[360px] rounded-[28px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* CLOSE BUTTON - Smaller hit area for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="p-5 sm:p-8 flex flex-col items-center text-center overflow-y-auto">
          {/* SECURITY ICON AREA - Reduced size on mobile */}
          <div className="relative mb-3 sm:mb-6 shrink-0">
            <div className="absolute inset-0 bg-orange-500/15 blur-2xl rounded-full" />
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-orange-50 text-orange-600 rounded-xl sm:rounded-[24px] flex items-center justify-center">
              <Key
                size={22}
                className={clsx("sm:w-7 sm:h-7", loading && "animate-pulse")}
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* TYPOGRAPHY - Tighter leading */}
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Reset Access PIN?
          </h3>
          <p className="mt-2 text-[11px] sm:text-sm font-medium text-slate-500 leading-relaxed px-1">
            This will immediately invalidate the login for
            <span className="text-slate-900 font-bold italic">
              {" "}
              {staff.name}
            </span>
            .
          </p>

          {/* DATA PREVIEW CARD - Compact layout */}
          <div className="mt-5 w-full space-y-1.5">
            <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Assignee
              </span>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tighter">
                {staff.role}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 bg-orange-50/50 rounded-xl border border-orange-100">
              <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">
                Active PIN
              </span>
              <span className="text-sm font-black text-orange-600 tracking-[0.2em]">
                {staff.staffPin}
              </span>
            </div>
          </div>

          {/* WARNING LABEL - Slimmer padding */}
          <div className="mt-5 flex items-start gap-2 text-left bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
            <AlertTriangle
              size={14}
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <p className="text-[10px] font-medium text-amber-700 leading-tight">
              Action cannot be undone. Make sure the staff member is ready to
              receive the new code.
            </p>
          </div>

          {/* ACTIONS - Side-by-side on mobile to save height */}
          <div className="mt-6 flex flex-row gap-2 w-full">
            <button
              onClick={onClose}
              className="flex-1 h-11 sm:h-12 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-100"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-[1.5] h-11 sm:h-12 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-orange-600 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Reset Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
