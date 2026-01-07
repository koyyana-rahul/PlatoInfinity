// src/modules/manager/staff/modals/RegeneratePinModal.jsx
import { FaKey } from "react-icons/fa";

export default function RegeneratePinModal({
  staff,
  loading,
  onConfirm,
  onClose,
}) {
  if (!staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 animate-scaleIn">
        {/* ICON */}
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 text-orange-600 mb-4">
          <FaKey size={18} />
        </div>

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          Regenerate PIN?
        </h3>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 text-center mt-2">
          This will invalidate the old PIN for
          <span className="font-medium text-gray-900"> {staff.name}</span>. The
          staff member must use the new PIN to log in.
        </p>

        {/* STAFF INFO */}
        <div className="mt-4 rounded-xl border bg-gray-50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium">{staff.role}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-500">Current PIN</span>
            <span className="font-mono">{staff.staffPin}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1
              py-2
              rounded-xl
              bg-orange-600
              hover:bg-orange-700
              text-white
              text-sm
              font-semibold
              disabled:opacity-60
            "
          >
            {loading ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      </div>
    </div>
  );
}
