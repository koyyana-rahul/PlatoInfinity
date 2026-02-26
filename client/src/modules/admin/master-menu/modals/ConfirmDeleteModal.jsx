import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmText = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* MODAL SHEET */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-y-auto scrollbar-hide">
        {/* TOP DANGER ACCENT */}
        <div className="h-1.5 w-full bg-red-500" />

        <div className="p-5 sm:p-6 flex flex-col items-center text-center">
          {/* ICON */}
          <div className="relative mb-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200 shadow-sm">
              <Trash2 size={24} strokeWidth={2.5} />
            </div>

            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border border-red-100">
              <AlertCircle
                size={12}
                className="text-red-500"
                strokeWidth={2.5}
              />
            </div>
          </div>

          {/* MESSAGING */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {title || "Confirm Deletion"}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
              {description ||
                "This action cannot be undone. The item will be permanently removed."}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="w-full space-y-3 mt-6">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "w-full h-11 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                "font-semibold text-sm text-white shadow-md",
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 hover:shadow-lg",
              )}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} strokeWidth={2.5} />
              ) : (
                <>
                  <Trash2 size={16} strokeWidth={2.5} />
                  {confirmText}
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full h-11 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
