import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import { FiHash, FiUsers, FiInfo, FiX, FiPlus } from "react-icons/fi";
import clsx from "clsx";

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

      toast.success("Table registered successfully");
      onSuccess?.(res.data?.data);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
      {/* GLASS BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* MODAL CARD - Max height constrained for short mobile screens */}
      <div className="relative bg-white w-full max-w-[400px] rounded-[24px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* HEADER - Tighter vertical padding on mobile */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-8 pb-3 sm:pb-4 flex justify-between items-start border-b border-slate-50 sm:border-none">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Add Table
            </h2>
            <p className="text-[9px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">
              Inventory Unit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-50 text-slate-400 rounded-full hover:text-red-500 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* BODY - Scrollable if content overflows mobile height */}
        <div className="px-5 sm:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          <InputField
            label="Number / Code"
            icon={FiHash}
            placeholder="e.g. 12 or VIP-1"
            value={form.tableCode}
            onChange={(v) => setForm({ ...form, tableCode: v })}
            required
          />

          <InputField
            label="Seating Cap."
            icon={FiUsers}
            type="number"
            value={form.seatingCapacity}
            onChange={(v) => setForm({ ...form, seatingCapacity: v })}
            min={1}
          />

          {/* DYNAMIC PREVIEW - Highly condensed for mobile */}
          <div className="flex items-center gap-3 bg-slate-50/50 border border-slate-100 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="p-1.5 sm:p-2.5 bg-white rounded-lg sm:rounded-xl shadow-sm text-emerald-500 shrink-0">
              <FiInfo size={14} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">
                Stored As
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">
                <span className="text-emerald-600 font-black">
                  Table {form.tableCode || "..."}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER - Fixed padding tier */}
        <div className="px-5 sm:px-8 py-4 sm:py-6 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-3 items-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="
              flex items-center gap-2
              bg-slate-900 text-white px-5 sm:px-8 h-10 sm:h-12 rounded-xl sm:rounded-2xl
              text-[10px] font-black uppercase tracking-widest
              hover:bg-emerald-600 active:scale-95 
              disabled:opacity-50 shadow-lg shadow-slate-200 transition-all
            "
          >
            {loading ? (
              "..."
            ) : (
              <>
                <FiPlus strokeWidth={3} className="w-3 h-3 sm:w-4 sm:h-4" />
                Create Table
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

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
    <div className="space-y-1 sm:space-y-2">
      <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      <div className="relative group">
        <div className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
          <Icon size={14} className="sm:w-[18px] sm:h-[18px]" />
        </div>

        <input
          type={type}
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-10 sm:h-14 pl-10 sm:pl-12 pr-4
            bg-white border border-slate-100 rounded-xl sm:rounded-2xl
            text-xs sm:text-sm font-bold text-slate-900 shadow-sm
            placeholder:text-slate-200 placeholder:font-medium
            focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500
            transition-all
          "
        />
      </div>
    </div>
  );
}
