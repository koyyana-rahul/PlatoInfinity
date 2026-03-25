import { Trash2, AlertCircle, Loader2, X } from "lucide-react";
import clsx from "clsx";

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmText = "Delete",
  targetLabel,
  impact,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* MODAL SHEET */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-[28px] shadow-[0_24px_70px_-35px_rgba(15,23,42,0.65)] border border-gray-100 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200">
        {/* TOP BANNER */}
        <div className="h-2 w-full bg-gradient-to-r from-[#FC8019] via-[#FF6B35] to-rose-500" />

        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Delete confirmation
            </div>
            <button
              onClick={onCancel}
              className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition"
              aria-label="Close"
            >
              <X size={16} className="mx-auto" />
            </button>
          </div>

          <div className="mt-5 flex items-start gap-4">
            {/* ICON */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200 shadow-sm">
                <Trash2 size={22} strokeWidth={2.5} />
              </div>

              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-red-100">
                <AlertCircle
                  size={10}
                  className="text-red-500"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            {/* MESSAGING */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title || "Confirm Deletion"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">
                {description ||
                  "This action cannot be undone. The item will be permanently removed."}
              </p>
              {targetLabel && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                  Deleting:{" "}
                  <span className="font-bold normal-case">{targetLabel}</span>
                </div>
              )}
              {impact && (
                <div className="mt-2 text-xs text-red-600 font-medium">
                  {impact}
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100 my-5" />

          {/* ACTIONS */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "w-full h-11 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                "font-semibold text-sm text-white shadow-[0_12px_25px_-15px_rgba(220,38,38,0.65)]",
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 hover:shadow-lg",
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
              className="w-full h-11 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              Keep
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
