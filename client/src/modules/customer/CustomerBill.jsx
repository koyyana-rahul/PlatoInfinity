import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

export default function CustomerBill() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;
  const sessionKey = `plato:customerSession:${tableId}`;
  const joined = Boolean(localStorage.getItem(sessionKey));

  const [loading, setLoading] = useState(true);
  const [bill, setBill] = useState(null);

  const load = async () => {
    if (!joined) {
      setBill(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await Axios(customerApi.bill.get);
      setBill(res.data?.data || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bill not available yet");
      setBill(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />;
  }

  if (!joined) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bill</h1>
            <p className="text-sm text-gray-600 mt-1">Final bill for this session.</p>
          </div>
          <button
            onClick={() => navigate(base)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-900 whitespace-nowrap"
          >
            Join now
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          Please join the table session first.
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="bg-white border rounded-2xl p-6 text-gray-600">
        Bill not generated yet. Ask staff for the bill when you are ready.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bill</h1>
          <p className="text-sm text-gray-600 mt-1">Final bill for this session.</p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50 whitespace-nowrap"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white border rounded-2xl divide-y">
        {(bill.items || []).map((it, idx) => (
          <div key={idx} className="p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{it.name}</p>
              <p className="text-xs text-gray-500">
                Qty: {it.quantity} · ₹{Math.round(it.rate || 0)}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-900">₹{Math.round(it.lineTotal || 0)}</p>
          </div>
        ))}

        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Info label="Subtotal" value={`₹${Math.round(bill.subtotal || 0)}`} />
          <Info label="Taxes" value={`₹${Math.round(bill.taxes || 0)}`} />
          <Info label="Total" value={`₹${Math.round(bill.total || 0)}`} />
          <Info label="Status" value={bill.status} />
        </div>
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
