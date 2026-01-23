import { FiAlertTriangle, FiTrash2, FiX, FiLoader } from "react-icons/fi";
import clsx from "clsx";

/**
 * ConfirmRemoveModal
 * Design: Centered destructive confirmation using Brand Emerald
 */
export default function ConfirmRemoveModal({
  manager,
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!manager) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      {/* 1. BACKDROP: Blurred for focus */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* 2. MODAL CARD */}
      <div className="relative bg-white w-full max-w-sm rounded-[40px] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-300 hover:text-slate-900 transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="p-8 space-y-8 text-center">
          {/* ALERT ICON */}
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center mx-auto shadow-inner">
            <FiAlertTriangle size={32} strokeWidth={2.5} />
          </div>

          {/* TITLES */}
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
              Remove Manager
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Confirm this action
            </p>
          </div>

          {/* MANAGER DETAILS */}
          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-3xl space-y-1">
            <p className="text-sm font-black text-slate-900 truncate">
              {manager.name}
            </p>
            <p className="text-[11px] font-bold text-slate-400 truncate tracking-tight lowercase">
              {manager.email}
            </p>
          </div>

          {/* SIMPLE WARNINGS */}
          <div className="text-[11px] font-bold text-slate-500/80 leading-relaxed uppercase tracking-tight space-y-1">
            <p>• Loses access immediately</p>
            <p>• Action cannot be undone</p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3",
                loading
                  ? "bg-slate-200 text-slate-500"
                  : "bg-emerald-500 text-white shadow-emerald-200/50 hover:bg-emerald-600 hover:shadow-emerald-400/40",
              )}
            >
              {loading ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiTrash2 size={16} strokeWidth={3} />
              )}
              {loading ? "Removing..." : "Remove Access"}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full h-12 text-[11px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
            >
              Keep Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
