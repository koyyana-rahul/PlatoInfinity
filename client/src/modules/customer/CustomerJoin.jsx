import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

export default function CustomerJoin() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState(null);

  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;
  const sessionKey = `plato:customerSession:${tableId}`;
  const existingSessionId = localStorage.getItem(sessionKey);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await Axios(customerApi.publicTable(tableId));
        setTable(res.data?.data || null);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Invalid table QR");
        setTable(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tableId]);

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
          tableId,
          tablePin: pin,
        },
      });

      const sessionId = res.data?.data?.sessionId;
      if (sessionId) {
        localStorage.setItem(sessionKey, String(sessionId));
      }

      toast.success("Joined table session");
      navigate(`${base}/menu`, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid PIN");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />;
  }

  if (!table) {
    return (
      <div className="bg-white border rounded-2xl p-6">
        <h1 className="text-lg font-semibold text-gray-900">Table not found</h1>
        <p className="text-sm text-gray-600 mt-2">
          Please scan the QR again or ask staff.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
      <p className="text-sm text-gray-600 mt-1">
        Enter the table PIN to start ordering.
      </p>

      {existingSessionId ? (
        <div className="mt-4 bg-white border rounded-2xl p-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">You are already joined</p>
            <p className="text-xs text-gray-600 mt-1">
              Continue to menu to add items.
            </p>
          </div>
          <button
            onClick={() => navigate(`${base}/menu`)}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-black text-white hover:bg-gray-900 whitespace-nowrap"
          >
            Continue
          </button>
        </div>
      ) : null}

      <div className="mt-6 bg-white border rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Info label="Table" value={table.tableNumber} />
          <Info label="Seats" value={table.seatingCapacity} />
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-gray-600">Table PIN</label>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder="1234"
            className="mt-1 w-full h-11 border rounded-lg px-3 text-sm tracking-widest"
          />
        </div>

        <button
          onClick={join}
          disabled={submitting}
          className="mt-4 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Joining..." : "Join & View Menu"}
        </button>

        <p className="mt-3 text-xs text-gray-500">
          You must join the session to access menu/cart/orders.
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-3">
      <p className="text-[10px] text-gray-500">{label}</p>
      <p className="text-xs font-semibold text-gray-900 break-all">{value}</p>
    </div>
  );
}
