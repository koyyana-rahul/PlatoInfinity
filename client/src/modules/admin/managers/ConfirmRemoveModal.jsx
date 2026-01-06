// src/modules/admin/managers/ConfirmRemoveModal.jsx
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";

export default function ConfirmRemoveModal({
  manager,
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 sm:p-7 space-y-6">
        {/* ================= HEADER ================= */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
            <FiAlertTriangle size={18} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Remove Manager
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* ================= MESSAGE ================= */}
        <div className="space-y-3">
          <p className="text-sm text-gray-700">You are about to remove:</p>

          <div className="rounded-lg border bg-gray-50 p-3">
            <p className="font-medium text-gray-900">{manager.name}</p>
            <p className="text-xs text-gray-500 break-all">{manager.email}</p>
          </div>

          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-700">
            • Manager will lose access immediately
            <br />
            • Cannot manage orders or staff
            <br />• You’ll need to re-invite them again if needed
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FiTrash2 size={14} />
            {loading ? "Removing…" : "Remove Manager"}
          </button>
        </div>
      </div>
    </div>
  );
}
