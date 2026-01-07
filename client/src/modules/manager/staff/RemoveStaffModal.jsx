import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function RemoveStaffModal({
  staff,
  loading,
  onClose,
  onConfirm,
}) {
  const isActive = staff.isActive;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3
            className={`font-semibold text-lg ${
              isActive ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {isActive ? "Deactivate Staff" : "Activate Staff"}
          </h3>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm">
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="font-medium">{staff.name}</p>
            <p className="text-xs text-gray-500">
              Code: <span className="font-mono">{staff.staffCode}</span>
            </p>
            <p className="text-xs text-gray-500">Role: {staff.role}</p>
          </div>

          <div
            className={`rounded-lg p-3 text-xs ${
              isActive
                ? "bg-amber-50 border border-amber-100 text-amber-800"
                : "bg-emerald-50 border border-emerald-100 text-emerald-800"
            }`}
          >
            {isActive ? (
              <>
                • Login will be disabled
                <br />
                • PIN will be invalidated
                <br />• Attendance will stop
              </>
            ) : (
              <>
                • Login access restored
                <br />
                • New PIN can be generated
                <br />• Staff can start shift
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="text-sm px-4 py-2">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-sm font-medium text-white ${
              isActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {loading ? "Processing…" : isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
