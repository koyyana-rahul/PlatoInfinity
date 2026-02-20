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
    <div className="max-w-lg mx-auto p-6 bg-white rounded-3xl">
      <h1 className="text-xl font-bold">Welcome</h1>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Info label="Table" value={table.tableNumber} />
        <Info label="Seats" value={table.seatingCapacity} />
      </div>

      <div className="mt-6 space-y-3">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-900">
          ✅ No PIN required to browse or add items.
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
          🔔 To place your order, call or wave for the waiter. They will give
          you the Table PIN to submit.
          <div className="mt-2 text-[12px] text-amber-800">
            हिंदी: ऑर्डर देने के लिए वेटर को बुलाएँ। वे आपको टेबल PIN बताएँगे।
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`${base}/menu`, { replace: true })}
        className="mt-6 w-full py-3 bg-black text-white rounded-xl"
      >
        View Menu
      </button>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="border rounded-xl p-3 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
