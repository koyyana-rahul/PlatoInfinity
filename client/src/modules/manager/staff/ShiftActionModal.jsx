import { FiX, FiAlertTriangle } from "react-icons/fi";

export default function ShiftActionModal({
  open,
  title,
  description,
  confirmLabel,
  loading,
  tone = "orange",
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  const toneClass =
    tone === "red"
      ? "bg-red-600 hover:bg-red-700"
      : tone === "green"
        ? "bg-green-600 hover:bg-green-700"
        : "bg-orange-500 hover:bg-orange-600";

  const iconToneClass =
    tone === "red"
      ? "bg-red-50 text-red-600 border-red-200"
      : tone === "green"
        ? "bg-green-50 text-green-600 border-green-200"
        : "bg-orange-50 text-orange-600 border-orange-200";

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <FiX size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div
            className={`w-12 h-12 rounded-lg border flex items-center justify-center ${iconToneClass}`}
          >
            <FiAlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>

          <div className="pt-1 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 h-10 text-white rounded-lg text-sm font-semibold disabled:opacity-60 ${toneClass}`}
            >
              {loading ? "Please wait..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
