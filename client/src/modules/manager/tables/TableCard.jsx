import { FiUsers, FiDownload, FiCopy, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";
import { useState } from "react";

const STATUS_STYLE = {
  FREE: "bg-emerald-100 text-emerald-700",
  OCCUPIED: "bg-red-100 text-red-700",
  RESERVED: "bg-yellow-100 text-yellow-700",
};

export default function TableCard({ table }) {
  const [imgError, setImgError] = useState(false);

  const qrImage = table?.qrImageUrl?.trim();
  const qrLink = table?.qrUrl?.trim();

  /* ================= COPY LINK ================= */
  const copyLink = async () => {
    if (!qrLink) {
      toast.error("QR link not ready yet");
      return;
    }
    await navigator.clipboard.writeText(qrLink);
    toast.success("QR link copied");
  };

  /* ================= DOWNLOAD QR ================= */
  const downloadQr = async () => {
    if (!qrImage) {
      toast.error("QR image not ready yet");
      return;
    }

    try {
      const res = await fetch(qrImage, { cache: "no-store" });
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `table-${table.tableNumber}-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download QR");
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">{table.tableNumber}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            STATUS_STYLE[table.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {table.status}
        </span>
      </div>

      {/* ================= QR ================= */}
      <div className="flex justify-center">
        {qrImage && !imgError ? (
          <img
            src={qrImage}
            alt="Table QR"
            loading="lazy"
            className="h-36 w-36 object-contain border rounded-lg"
            onError={() => {
              console.error("QR failed to load:", qrImage);
              setImgError(true);
            }}
          />
        ) : (
          <div className="h-36 w-36 flex flex-col items-center justify-center border rounded-lg bg-gray-50 text-gray-400">
            <FiImage className="text-3xl mb-1" />
            <span className="text-xs">QR generating…</span>
          </div>
        )}
      </div>

      {/* ================= META ================= */}
      <div className="flex justify-between text-xs text-gray-700">
        <span className="flex items-center gap-1">
          <FiUsers /> {table.seatingCapacity} seats
        </span>
        <span className="text-gray-400">ID: {table._id.slice(-6)}</span>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={downloadQr}
          disabled={!qrImage}
          className="
            border rounded-lg py-2 text-xs
            text-emerald-700 hover:bg-emerald-50
            disabled:opacity-50
          "
        >
          <FiDownload className="inline mr-1" />
          Download
        </button>

        <button
          onClick={copyLink}
          disabled={!qrLink}
          className="
            border rounded-lg py-2 text-xs
            hover:bg-gray-50
            disabled:opacity-50
          "
        >
          <FiCopy className="inline mr-1" />
          Copy Link
        </button>
      </div>
    </div>
  );
}
