import { useState } from "react";
import {
  FiUsers,
  FiDownload,
  FiCopy,
  FiImage,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import clsx from "clsx";

const STATUS_STYLE = {
  FREE: "bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-emerald-500/[0.03]",
  OCCUPIED: "bg-red-50 text-red-600 border-red-100/50 shadow-red-500/[0.03]",
  RESERVED:
    "bg-amber-50 text-amber-600 border-amber-100/50 shadow-amber-500/[0.03]",
};

export default function TableCard({ table, onDeleted, isSelected, onSelect }) {
  const [imgError, setImgError] = useState(false);

  const qrImage = table?.qrImageUrl?.trim();
  const qrLink = table?.qrUrl?.trim();

  /* ================= HELPERS ================= */
  const copyLink = async (e) => {
    e.stopPropagation();
    if (!qrLink) return toast.error("Syncing terminal link...");
    try {
      await navigator.clipboard.writeText(qrLink);
      toast.success("Access link secured");
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  const downloadQr = async (e) => {
    e.stopPropagation();
    if (!qrImage) return toast.error("QR generating...");
    const exportToast = toast.loading("Preparing high-res export...");
    try {
      const res = await fetch(qrImage, { cache: "no-store" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TABLE-${table.tableNumber}-QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("QR Exported", { id: exportToast });
    } catch {
      toast.error("Export failed", { id: exportToast });
    }
  };

  return (
    <article
      onClick={() => onSelect?.(table._id)}
      className={clsx(
        "group relative bg-white border rounded-[32px] p-4 sm:p-5 flex flex-col gap-4 transition-all duration-500 cursor-pointer overflow-hidden h-full",
        isSelected
          ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-xl shadow-emerald-500/5"
          : "border-slate-100 hover:shadow-[0_20px_50px_rgba(15,23,42,0.06)] hover:border-slate-200 hover:scale-[1.01] active:scale-[0.98]",
      )}
    >
      {/* ================= SELECTION INDICATOR ================= */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-20 animate-in zoom-in duration-300">
          <FiCheckCircle className="text-emerald-500 fill-white" size={24} />
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start z-10">
        <div className="min-w-0">
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none truncate">
            {table.tableNumber}
          </h3>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2 tabular-nums">
            ID: {table._id.slice(-5).toUpperCase()}
          </p>
        </div>

        {!isSelected && (
          <span
            className={clsx(
              "text-[8px] sm:text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border transition-all duration-500 shadow-sm",
              STATUS_STYLE[table.status] ||
                "bg-slate-50 text-slate-500 border-slate-100",
            )}
          >
            {table.status}
          </span>
        )}
      </div>

      {/* ================= QR CANVAS ================= */}
      <div className="relative aspect-square flex items-center justify-center bg-[#FAFAFA] rounded-[24px] sm:rounded-[30px] overflow-hidden border border-slate-50 group-hover:bg-white group-hover:border-slate-100 transition-all duration-700 shadow-inner">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover:opacity-[0.05] transition-opacity" />

        {qrImage && !imgError ? (
          <img
            src={qrImage}
            alt={`QR Access code for ${table.tableNumber}`}
            className="w-[72%] h-[72%] object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2 filter drop-shadow-md"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-200 animate-pulse">
            <FiImage size={32} strokeWidth={1} className="mb-2" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">
              Syncing
            </span>
          </div>
        )}
      </div>

      {/* ================= META & QUICK COPY ================= */}
      <div className="flex justify-between items-center bg-slate-50/50 rounded-2xl p-2.5 sm:p-3 border border-slate-100/50 group-hover:bg-slate-50 group-hover:border-slate-200 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100/50 transition-transform group-hover:rotate-[-6deg]">
            <FiUsers size={14} className="text-emerald-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs sm:text-sm font-black text-slate-800 tabular-nums">
              {table.seatingCapacity}
            </span>
            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold mt-1">
              Capacity
            </span>
          </div>
        </div>

        <button
          onClick={copyLink}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-white rounded-lg transition-all active:scale-90"
          title="Copy Access Link"
        >
          <FiCopy size={15} />
        </button>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="grid grid-cols-2 gap-2.5 mt-auto">
        <button
          onClick={downloadQr}
          disabled={!qrImage}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-100 bg-white text-slate-600 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
        >
          <FiDownload size={12} strokeWidth={3} />
          Export
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleted?.(table);
          }}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-black text-[9px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 border border-red-100/20"
        >
          <FiTrash2 size={12} strokeWidth={3} />
          Remove
        </button>
      </div>
    </article>
  );
}
