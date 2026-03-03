import { KeyRound, X, AlertTriangle } from "lucide-react";

export default function RegeneratePinModal({
  staff,
  loading,
  onConfirm,
  onClose,
}) {
  if (!staff) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-4">
          <div className="w-12 h-12 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <KeyRound size={22} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900">Regenerate PIN</h3>
            <p className="text-sm text-gray-600 mt-1">
              This will invalidate the current PIN for{" "}
              <span className="font-semibold">{staff.name}</span>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase">Role</span>
              <span className="text-sm font-semibold text-gray-900 uppercase">
                {staff.role}
              </span>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
              <span className="text-xs text-orange-700 uppercase">
                Current PIN
              </span>
              <span className="text-sm font-semibold text-orange-700 tracking-wider">
                {staff.staffPin || "----"}
              </span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Share the new PIN with staff immediately after reset.
          </div>

          <div className="pt-1 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-10 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-10 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset PIN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
