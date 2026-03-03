// src/modules/customer/pages/CustomerJoin.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";

export default function CustomerJoin() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState(null);

  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  /* ================= LOAD TABLE ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await Axios(customerApi.publicTable(tableId));
        setTable(res.data?.data || null);
      } catch {
        toast.error("Invalid table QR");
        setTable(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [tableId]);

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-72 bg-gray-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!table) {
    return (
      <div className="max-w-lg mx-auto min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full p-6 bg-white rounded-3xl ring-1 ring-slate-100 shadow-sm text-center">
          <p className="text-lg font-bold text-slate-900">Table not found</p>
          <p className="text-sm text-slate-500 mt-1">
            Please scan a valid QR code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6 bg-transparent min-h-[calc(100vh-120px)] flex flex-col">
      {/* HEADER CARD */}
      <div className="bg-white/95 ring-1 ring-slate-100 rounded-3xl p-5 sm:p-6 mb-5 shadow-[0_16px_35px_-26px_rgba(15,23,42,0.45)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Welcome 👋
            </h1>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              Your table is ready to order
            </p>
          </div>
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-xl text-xs font-bold tracking-wide">
            🍽️ Dining
          </div>
        </div>
      </div>

      {/* TABLE INFO CARDS */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Kpi label="Table" value={`#${table.tableNumber}`} />
        <Kpi label="Seats" value={table.seatingCapacity} tone="orange" />
      </div>

      {/* INFORMATION BOXES */}
      <div className="space-y-3 mb-7 flex-1">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
          <p className="font-semibold mb-1">✅ Browse Without PIN</p>
          <p className="text-xs leading-relaxed">
            No PIN needed to explore items and add to cart.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-sm text-orange-900">
          <p className="font-semibold mb-1">🔔 PIN for Checkout</p>
          <p className="text-xs leading-relaxed mb-2">
            Call the waiter when ready. They'll provide your Table PIN to
            finalize order.
          </p>
          <p className="text-[11px] text-orange-800 italic">
            हिंदी: ऑर्डर देने के लिए वेटर को बुलाएँ। वे आपको PIN बताएँगे।
          </p>
        </div>
      </div>

      {/* CTA BUTTON */}
      <button
        onClick={() => navigate(`${base}/menu`, { replace: true })}
        className="w-full h-14 bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] text-white rounded-2xl font-black text-xs sm:text-sm hover:brightness-105 transition shadow-[0_12px_30px_-18px_rgba(243,92,43,0.65)] tracking-wider uppercase"
      >
        Start Browsing Menu
      </button>
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : "bg-white border-gray-200 text-gray-700";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-wider font-bold">{label}</p>
      <p className="text-2xl font-black mt-1 leading-none">{value}</p>
    </div>
  );
}
