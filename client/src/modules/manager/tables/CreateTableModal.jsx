import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import { FiX, FiGrid, FiUsers } from "react-icons/fi";

export default function CreateTableModal({ restaurantId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    tableCode: "",
    seatingCapacity: 4,
  });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.tableCode.trim()) {
      toast.error("Enter a table number");
      return false;
    }
    if (Number(form.seatingCapacity) <= 0) {
      toast.error("Capacity must be at least 1");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    const tableNumber = `Table ${form.tableCode.trim()}`;

    try {
      setLoading(true);
      const res = await Axios({
        ...tableApi.create(restaurantId),
        data: {
          tableNumber,
          seatingCapacity: Number(form.seatingCapacity),
        },
      });

      toast.success("Table created successfully");
      onSuccess?.(res.data?.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to create table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <FiX size={18} />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1 mb-3">
              <FiGrid size={12} /> Table Setup
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Table</h2>
            <p className="text-sm text-gray-600 mt-1.5">
              Add a dine-in table with QR ordering enabled.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Table Number / Code
            </label>
            <input
              value={form.tableCode}
              onChange={(e) =>
                setForm((p) => ({ ...p, tableCode: e.target.value }))
              }
              placeholder="e.g. 12 or VIP-1"
              className="w-full h-11 px-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Seating Capacity
            </label>
            <div className="relative">
              <FiUsers
                className="absolute left-3 top-3.5 text-gray-400"
                size={14}
              />
              <input
                type="number"
                min={1}
                value={form.seatingCapacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, seatingCapacity: e.target.value }))
                }
                className="w-full h-11 pl-9 pr-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400"
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Preview
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              Table {form.tableCode || "..."}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {Number(form.seatingCapacity || 0)} seat capacity
            </p>
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
              onClick={submit}
              disabled={loading}
              className="flex-1 h-11 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Table"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
