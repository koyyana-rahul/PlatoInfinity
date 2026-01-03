import { Trash2, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* MODAL */}
      <div className="relative w-[92%] max-w-sm bg-white rounded-2xl shadow-xl p-5">
        {/* CLOSE */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-gray-100"
        >
          <X size={16} />
        </button>

        {/* ICON */}
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
          <Trash2 size={22} />
        </div>

        {/* TEXT */}
        <h3 className="text-sm font-black text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 active:scale-95"
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
