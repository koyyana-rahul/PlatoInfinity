import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

export default function CustomerOrders() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;
  const sessionKey = `plato:customerSession:${tableId}`;

  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const sid = localStorage.getItem(sessionKey);
      setSessionId(sid || null);

      if (!sid) {
        setOrders([]);
        return;
      }

      const res = await Axios(customerApi.order.listBySession(sid));
      setOrders(res.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tableId]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">Track your order status.</p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg text-sm font-medium border bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
      ) : !sessionId ? (
        <div className="bg-white border rounded-2xl p-6 text-gray-600 flex items-start justify-between gap-3">
          <div className="min-w-0">
            Please join the table session first.
          </div>
          <button
            onClick={() => navigate(base)}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-black text-white hover:bg-gray-900 whitespace-nowrap"
          >
            Join now
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border rounded-2xl p-6 text-gray-600">No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border rounded-2xl p-4">
              <div className="flex justify-between">
                <p className="text-sm font-semibold text-gray-900">Order #{o.orderNumber}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {o.orderStatus}
                </span>
              </div>
              <div className="mt-3 divide-y">
                {(o.items || []).map((it) => (
                  <div key={it._id} className="py-2 flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{it.name}</p>
                      <p className="text-xs text-gray-500">Qty: {it.quantity} · {it.itemStatus}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      ₹{Math.round((it.price || 0) * (it.quantity || 0))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
