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
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* MODAL CARD */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 sm:right-5 top-4 sm:top-5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
        >
          <FiX size={18} />
        </button>

        {/* HEADER */}
        <div className="px-5 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 border-b border-gray-200 text-center">
          {/* DANGER ICON */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 border border-red-200 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FiAlertTriangle
              size={28}
              strokeWidth={2}
              className="sm:w-8 sm:h-8"
            />
          </div>

          {/* TITLE */}
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
            Remove Manager Access?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
            This action cannot be undone
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-4">
          {/* MANAGER CARD */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start gap-3">
              <FiLock size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {manager.name}
                </h4>
                <p className="text-xs text-gray-600 truncate mt-0.5">
                  {manager.email}
                </p>
              </div>
            </div>
          </div>

          {/* CONSEQUENCES */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-900">What happens:</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">•</span>
                <span>Loses admin access immediately</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">•</span>
                <span>Cannot be reversed without new invite</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">•</span>
                <span>Active sessions will be terminated</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "w-full h-11 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2",
              loading
                ? "bg-gray-300 text-gray-600 cursor-wait"
                : "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg",
            )}
          >
            {loading ? (
              <>
                <FiLoader size={16} className="animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <FiTrash2 size={16} strokeWidth={2.5} />
                <span>Remove Access</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full h-11 px-4 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
          >
            Keep Access
          </button>
        </div>
      </div>
    </div>
  );
}
