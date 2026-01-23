import {
  FiAlertTriangle,
  FiTrash2,
  FiX,
  FiLoader,
  FiLock,
} from "react-icons/fi";
import clsx from "clsx";

/**
 * ConfirmRemoveModal
 * Professional destructive confirmation dialog with responsive design
 */
export default function ConfirmRemoveModal({
  manager,
  onConfirm,
  onClose,
  loading = false,
}) {
  if (!manager) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4">
      {/* BACKDROP: Blurred for focus */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={!loading ? onClose : undefined}
      />

      {/* MODAL CARD */}
      <div className="relative bg-white w-full max-w-md rounded-3xl sm:rounded-4xl shadow-[0_40px_100px_-20px_rgba(15,23,42,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 sm:right-6 top-4 sm:top-6 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-50"
        >
          <FiX size={20} />
        </button>

        {/* HEADER */}
        <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-4 sm:pb-6 border-b border-slate-100 text-center">
          {/* DANGER ICON */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50/80 border border-red-100 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
            <FiAlertTriangle
              size={32}
              strokeWidth={2}
              className="sm:w-8 sm:h-8"
            />
          </div>

          {/* TITLE */}
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Remove Manager Access?
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
            This action cannot be undone
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* MANAGER CARD */}
          <div className="bg-gradient-to-br from-red-50 to-red-50/50 border border-red-100 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-2">
            <div className="flex items-start gap-3">
              <FiLock
                size={16}
                className="text-red-500 mt-0.5 shrink-0 sm:mt-1"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {manager.name}
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 truncate mt-0.5">
                  {manager.email}
                </p>
              </div>
            </div>
          </div>

          {/* CONSEQUENCES */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-2">
            <p className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-tight mb-3">
              What happens:
            </p>
            <div className="space-y-1.5 text-xs sm:text-sm font-semibold text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Loses admin access immediately</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Cannot be reversed without new invite</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-1">•</span>
                <span>Active sessions will be terminated</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-slate-100 bg-slate-50/30 flex flex-col gap-3 sm:gap-4">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-tight transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 sm:gap-3 duration-200",
              loading
                ? "bg-slate-300 text-slate-500 cursor-wait"
                : "bg-red-500 text-white shadow-red-200/50 hover:bg-red-600 hover:shadow-red-400/40",
            )}
          >
            {loading ? (
              <>
                <FiLoader size={14} className="animate-spin sm:w-4 sm:h-4" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <FiTrash2
                  size={14}
                  strokeWidth={2.5}
                  className="sm:w-4 sm:h-4"
                />
                <span>Remove Access</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full h-10 sm:h-11 px-4 sm:px-6 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg sm:rounded-xl uppercase tracking-tight transition-all disabled:opacity-50"
          >
            Keep Access
          </button>
        </div>
      </div>
    </div>
  );
}
