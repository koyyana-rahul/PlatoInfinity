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
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;
  const sessionKey = `plato:customerSession:${tableId}`;

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

  /* ================= JOIN SESSION ================= */
  const join = async () => {
    if (pin.length !== 4) {
      toast.error("Enter 4-digit PIN");
      return;
    }

    try {
      setSubmitting(true);

      const res = await Axios({
        ...customerApi.joinSession,
        data: {
          tableId: table._id, // ✅ ONLY tableId
          tablePin: pin, // ✅ STRING (important)
        },
      });

      const sessionId = res.data?.data?.sessionId;
      if (sessionId) {
        localStorage.setItem(sessionKey, sessionId);
      }

      toast.success("Joined table successfully");
      navigate(`${base}/menu`, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid table or PIN");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return <div className="h-72 bg-gray-200 rounded-3xl animate-pulse" />;
  }

  if (!table) {
    return <div className="p-6 bg-white rounded-2xl">Table not found</div>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-3xl">
      <h1 className="text-xl font-bold">Join Table</h1>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Info label="Table" value={table.tableNumber} />
        <Info label="Seats" value={table.seatingCapacity} />
      </div>

      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="mt-6 w-full h-14 border rounded-xl text-center text-lg tracking-widest"
        placeholder="1234"
      />

      <button
        onClick={join}
        disabled={submitting}
        className="mt-4 w-full py-3 bg-black text-white rounded-xl"
      >
        {submitting ? "Joining…" : "Join & View Menu"}
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
