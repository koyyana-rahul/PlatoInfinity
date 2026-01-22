import { FiX, FiAlertCircle, FiShield } from "react-icons/fi";
import clsx from "clsx";

export default function RemoveStaffModal({
  staff,
  loading,
  onClose,
  onConfirm,
}) {
  if (!staff) return null;
  const isActive = staff.isActive;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      {/* 1. GLASS BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* 2. CENTERED MODAL CARD */}
      <div className="relative bg-white w-full max-w-[380px] rounded-[28px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* CLOSE ICON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <FiX size={18} />
        </button>

        {/* SCROLLABLE CONTENT */}
        <div className="p-6 sm:p-10 flex flex-col items-center text-center overflow-y-auto">
          {/* SEMANTIC ICON AREA */}
          <div className="relative mb-4 sm:mb-6 shrink-0">
            <div
              className={clsx(
                "absolute inset-0 blur-2xl rounded-full",
                isActive ? "bg-red-500/15" : "bg-emerald-500/15",
              )}
            />

            <div
              className={clsx(
                "relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[24px] flex items-center justify-center",
                isActive
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              {isActive ? (
                <FiAlertCircle size={32} strokeWidth={1.5} />
              ) : (
                <FiShield size={32} strokeWidth={1.5} />
              )}
            </div>
          </div>

          {/* TYPOGRAPHY */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {isActive ? "Confirm Deactivation" : "Restore Access"}
          </h3>
          <p className="mt-2 text-[11px] sm:text-sm font-medium text-slate-500 leading-relaxed px-1">
            You are changing the system status for
            <span className="text-slate-900 font-bold italic">
              {" "}
              {staff.name}
            </span>
            .
          </p>

          {/* STAFF INFO MINI-CARD */}
          <div className="mt-6 w-full space-y-2">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Identify
              </span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {staff.staffCode}
              </span>
            </div>
          </div>

          {/* CONSEQUENCE LIST */}
          <div
            className={clsx(
              "mt-5 w-full p-4 rounded-xl border text-left",
              isActive
                ? "bg-red-50/50 border-red-100"
                : "bg-emerald-50/50 border-emerald-100",
            )}
          >
            <p
              className={clsx(
                "text-[10px] font-black uppercase tracking-widest mb-2",
                isActive ? "text-red-500" : "text-emerald-600",
              )}
            >
              System Changes:
            </p>
            <ul className="space-y-1.5">
              {isActive ? (
                <>
                  <li className="text-[11px] font-bold text-red-700 flex items-center gap-2">
                    • Access terminal disabled
                  </li>
                  <li className="text-[11px] font-bold text-red-700 flex items-center gap-2">
                    • Secure PIN invalidated
                  </li>
                </>
              ) : (
                <>
                  <li className="text-[11px] font-bold text-emerald-700 flex items-center gap-2">
                    • Restore terminal login
                  </li>
                  <li className="text-[11px] font-bold text-emerald-700 flex items-center gap-2">
                    • Re-generate access PIN
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* ACTIONS */}
          <div className="mt-8 flex flex-row gap-2 w-full">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 sm:h-12 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-100"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "flex-[1.5] h-11 sm:h-12 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2",
                isActive
                  ? "bg-red-600 shadow-red-100 hover:bg-red-700"
                  : "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700",
              )}
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isActive ? (
                "Deactivate"
              ) : (
                "Activate Now"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
