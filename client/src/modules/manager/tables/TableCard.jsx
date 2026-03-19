import { useState } from "react";
import {
  FiUsers,
  FiDownload,
  FiCopy,
  FiImage,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";
import { notify } from "../../../utils/notify";

const STATUS_STYLE = {
  FREE: "bg-green-50 text-green-700 border-green-200",
  OCCUPIED: "bg-red-50 text-red-700 border-red-200",
  RESERVED: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function TableCard({ table, onDelete }) {
  const [imgError, setImgError] = useState(false);

  const qrImage = table?.qrImageUrl?.trim();
  const qrLink = table?.qrUrl?.trim();
  const tableId = table?._id ? table._id.slice(-5).toUpperCase() : "-----";

  const copyLink = async () => {
    if (!qrLink) return notify.error("QR link not available");
    try {
      await navigator.clipboard.writeText(qrLink);
      notify.success("Link copied");
    } catch {
      notify.error("Copy failed");
    }
  };

  const downloadQr = async () => {
    if (!qrImage) return notify.error("QR image not available");
    const exportToast = notify.loading("Preparing download...");
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
      notify.success("QR downloaded", { id: exportToast });
    } catch {
      notify.error("Download failed", { id: exportToast });
    }
  };

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4 h-full shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900 leading-none">
            {table.tableNumber}
          </h3>
          <p className="text-[10px] text-gray-400 uppercase mt-2 tracking-wide">
            Table ID: {tableId}
          </p>
        </div>

        <span
          className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase border ${
            STATUS_STYLE[table.status] ||
            "bg-gray-50 text-gray-700 border-gray-200"
          }`}
        >
          {table.status}
        </span>
      </div>

      <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        {qrImage && !imgError ? (
          <img
            src={qrImage}
            alt={`QR Code for ${table.tableNumber}`}
            className="w-[70%] h-[70%] object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <FiImage size={28} className="mb-2" />
            <span className="text-[10px] font-medium uppercase">No QR</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3 border border-gray-200">
        <div className="flex items-center gap-2">
          <FiUsers size={14} className="text-orange-500" />
          <span className="text-sm font-semibold text-gray-800">
            {table.seatingCapacity} seats
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyLink}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-white rounded-lg"
            title="Copy link"
          >
            <FiCopy size={14} />
          </button>
          <a
            href={qrLink || "#"}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => !qrLink && e.preventDefault()}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-600 hover:bg-white rounded-lg disabled:opacity-40"
            title="Open link"
          >
            <FiExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={downloadQr}
          disabled={!qrImage}
          className="h-10 flex items-center justify-center gap-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold uppercase hover:bg-gray-50 disabled:opacity-40"
        >
          <FiDownload size={12} /> Export
        </button>

        <button
          onClick={() => onDelete?.(table)}
          className="h-10 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold uppercase hover:bg-red-100"
        >
          <FiTrash2 size={12} /> Remove
        </button>
      </div>
    </article>
  );
}
