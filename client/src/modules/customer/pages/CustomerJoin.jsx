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
    return <div className="h-72 bg-gray-200 rounded-3xl animate-pulse" />;
  }

  if (!table) {
    return <div className="p-6 bg-white rounded-2xl">Table not found</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white min-h-screen flex flex-col">
      {/* HEADER CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
            <p className="text-sm text-gray-600 mt-1">Ready to dine with us</p>
          </div>
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
            🍽️ Dining
          </div>
        </div>
      </div>

      {/* TABLE INFO CARDS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Kpi label="Table" value={`#${table.tableNumber}`} />
        <Kpi label="Seats" value={table.seatingCapacity} tone="orange" />
      </div>

      {/* INFORMATION BOXES */}
      <div className="space-y-3 mb-8 flex-1">
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
        className="w-full h-12 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition"
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
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
