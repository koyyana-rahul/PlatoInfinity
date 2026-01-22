import { FiTrash2, FiX, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import tableApi from "../../../api/table.api";
import { useState } from "react";
import clsx from "clsx";

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
      {/* GLASS BACKDROP */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* MODAL CARD */}
      <div className="relative bg-white w-full max-w-[380px] rounded-[28px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* CLOSE ICON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <FiX size={18} />
        </button>

        <div className="p-6 sm:p-10 flex flex-col items-center text-center">
          {/* SEMANTIC ICON AREA */}
          <div className="relative mb-4 sm:mb-6">
            <div className="absolute inset-0 bg-red-500/15 blur-2xl rounded-full" />
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-600 rounded-2xl sm:rounded-[24px] flex items-center justify-center border border-red-100">
              <FiTrash2 size={28} strokeWidth={1.5} />
            </div>
          </div>

          {/* TYPOGRAPHY */}
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Remove Table?
          </h3>
          <p className="mt-2 text-[11px] sm:text-sm font-medium text-slate-500 leading-relaxed px-1">
            You are about to delete
            <span className="text-slate-900 font-bold italic">
              {" "}
              {table.tableNumber}
            </span>
            .
          </p>

          {/* CONSEQUENCE CARD */}
          <div className="mt-5 w-full bg-amber-50/50 border border-amber-100 p-3 sm:p-4 rounded-xl text-left flex gap-3">
            <FiAlertTriangle
              size={16}
              className="text-amber-600 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest leading-none mb-1">
                Warning
              </p>
              <p className="text-[10px] sm:text-[11px] font-bold text-amber-800 leading-tight">
                This will invalidate the linked QR code immediately. Existing
                analytics are preserved.
              </p>
            </div>
          </div>

          {/* ACTIONS - Horizontal layout saves vertical space */}
          <div className="mt-8 flex flex-row gap-2 w-full">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 sm:h-12 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-100"
            >
              Keep it
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-[1.5] h-11 sm:h-12 bg-red-600 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Confirm Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
