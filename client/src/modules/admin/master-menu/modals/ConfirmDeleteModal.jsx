import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmText = "Delete Permanent",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* ================= BACKDROP (The Deep Blur Layer) ================= */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-[12px] cursor-default"
        onClick={onCancel}
      />

      {/* ================= MODAL SHEET ================= */}
      <div className="relative w-full max-w-[340px] max-h-[90vh] bg-white rounded-[28px] sm:rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/40 overflow-y-auto scrollbar-hide animate-in zoom-in-95 slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
        {/* TOP DANGER ACCENT */}
        <div className="sticky top-0 h-1.5 w-full bg-red-500 z-10" />

        <div className="p-5 sm:p-6 pt-6 sm:pt-8 flex flex-col items-center text-center">
          {/* CRITICAL ACTION ICON - Scaled for Mobile */}
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse" />

            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[22px] bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
              <Trash2 size={24} sm:size={28} strokeWidth={2.5} />
            </div>

            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-red-50">
              <AlertCircle
                size={10}
                sm:size={12}
                className="text-red-500"
                strokeWidth={3}
              />
            </div>
          </div>

          {/* MESSAGING AREA - Tightened Spacing */}
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-[15px] sm:text-[17px] font-[900] text-slate-900 tracking-tight leading-tight px-2 uppercase">
              {title || "Confirm Removal"}
            </h3>
            <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 leading-relaxed px-1">
              {description ||
                "This action is final. Registry entry will be removed."}
            </p>
          </div>

          {/* ACTIONS STACK - Optimized heights for thumb-reach */}
          <div className="w-full space-y-2.5 sm:space-y-3 mt-6 sm:mt-8">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "w-full h-12 sm:h-13 rounded-[18px] sm:rounded-[20px] flex items-center justify-center gap-2 transition-all duration-500 active:scale-[0.96]",
                "font-[900] text-[12px] sm:text-[13px] uppercase tracking-[0.15em] text-white",
                loading
                  ? "bg-slate-800 cursor-not-allowed opacity-80"
                  : "bg-gradient-to-br from-red-500 to-red-700 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.5)] active:shadow-none",
              )}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} strokeWidth={3} />
              ) : (
                <>
                  <Trash2 size={14} sm:size={16} strokeWidth={3} />
                  {confirmText}
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className="
                w-full h-11 sm:h-12 rounded-[18px] sm:rounded-[20px] 
                text-[11px] sm:text-[12px] font-black uppercase tracking-[0.15em] 
                text-slate-400 hover:text-slate-600 
                active:bg-slate-50 transition-all 
                active:scale-[0.96]
              "
            >
              Cancel
            </button>
          </div>
        </div>

        {/* COMPACT FOOTER TAG */}
        <div className="bg-slate-50/80 py-2.5 sm:py-3 border-t border-black/[0.03] flex justify-center backdrop-blur-sm">
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
            System Protection Active
          </span>
        </div>
      </div>
    </div>
  );
}
