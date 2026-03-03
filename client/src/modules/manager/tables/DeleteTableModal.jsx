import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function DeleteTableModal({
  restaurantId,
  table,
  onClose,
  onDeleted,
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await Axios(tableApi.delete(restaurantId, table._id));
      toast.success(`Table "${table.tableNumber}" removed`);
      onDeleted?.(table._id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to delete table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <FiX size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          <div className="w-12 h-12 rounded-xl border border-red-200 bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900">Delete Table</h3>
            <p className="text-sm text-gray-600 mt-1">
              You are about to delete{" "}
              <span className="font-semibold">{table.tableNumber}</span>.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            QR access for this table will stop immediately.
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              Table
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {table.tableNumber}
            </span>
          </div>

          <div className="pt-1 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 h-11 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete Table"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
