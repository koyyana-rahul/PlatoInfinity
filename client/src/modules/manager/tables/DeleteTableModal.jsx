import { FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import { useState } from "react";

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

      toast.success(`Table "${table.tableNumber}" deleted`);

      onDeleted?.(table._id);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to delete table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Delete Table</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mx-auto">
            <FiTrash2 className="text-red-600 text-2xl" />
          </div>

          <div className="text-center">
            <p className="text-gray-900 font-medium">
              Delete table{" "}
              <span className="font-semibold">{table.tableNumber}</span>?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action will disable the table and QR code.
              <br />
              Past orders will remain safe.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="
              bg-red-600 hover:bg-red-700
              text-white px-5 py-2 rounded-xl
              text-sm font-semibold
              disabled:opacity-60
            "
          >
            {loading ? "Deleting…" : "Delete Table"}
          </button>
        </div>
      </div>
    </div>
  );
}
