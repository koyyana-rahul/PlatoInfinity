import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import { FiHash, FiUsers } from "react-icons/fi";

export default function CreateTableModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    tableNumber: "",
    seatingCapacity: 4,
  });

  const [loading, setLoading] = useState(false);

  /* ================= VALIDATION ================= */
  const validate = () => {
    if (!form.tableNumber.trim()) {
      toast.error("Table number is required");
      return false;
    }

    if (Number(form.seatingCapacity) <= 0) {
      toast.error("Seating capacity must be greater than 0");
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await Axios({
        ...tableApi.create(),
        data: {
          tableNumber: form.tableNumber.trim(),
          seatingCapacity: Number(form.seatingCapacity),
        },
      });

      toast.success("Table created & QR generated");

      onSuccess?.(res.data?.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to create table");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* ================= HEADER ================= */}
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Table</h2>
          <p className="text-sm text-gray-600 mt-1">
            A QR code will be generated automatically for this table
          </p>
        </div>

        {/* ================= BODY ================= */}
        <div className="px-6 py-6 space-y-5">
          <InputField
            label="Table Number"
            icon={FiHash}
            placeholder="T1, Table 5, VIP-2"
            value={form.tableNumber}
            onChange={(v) => setForm({ ...form, tableNumber: v })}
            required
          />

          <InputField
            label="Seating Capacity"
            icon={FiUsers}
            type="number"
            value={form.seatingCapacity}
            onChange={(v) => setForm({ ...form, seatingCapacity: v })}
            min={1}
          />

          {/* INFO */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900">
            <p>
              Customers can scan the QR on this table to view the menu and place
              orders directly.
            </p>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="
              bg-emerald-600 hover:bg-emerald-700
              text-white px-6 py-2 rounded-xl
              text-sm font-semibold
              disabled:opacity-60
            "
          >
            {loading ? "Creating…" : "Create Table"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= INPUT FIELD ================= */
function InputField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  min,
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type={type}
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-12 pl-10 pr-3
            rounded-xl border
            text-sm text-gray-900
            focus:outline-none focus:ring-2 focus:ring-emerald-500
          "
        />
      </div>
    </div>
  );
}
