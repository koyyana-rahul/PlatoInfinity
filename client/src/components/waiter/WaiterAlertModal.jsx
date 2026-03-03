import Modal from "../ui/Modal";
import { Bell, CheckCircle2 } from "lucide-react";

export default function WaiterAlertModal({ alert, onClose, onAcknowledge }) {
  if (!alert) return null;

  return (
    <Modal title="Customer Call" onClose={onClose}>
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
          <Bell size={20} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {alert.tableName || "Table"} needs assistance
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {alert.reason || "Customer requested waiter support."}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-gray-500">
            Raised at
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {new Date(alert.createdAt || Date.now()).toLocaleTimeString()}
          </span>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => onAcknowledge?.(alert.id)}
            className="flex-1 h-11 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 inline-flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} /> Mark Attended
          </button>
        </div>
      </div>
    </Modal>
  );
}
