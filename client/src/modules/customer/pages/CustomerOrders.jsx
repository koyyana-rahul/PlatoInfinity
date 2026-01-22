import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";

export default function CustomerOrders() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();

  /* ================= SESSION ================= */
  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);
  const base = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  /* ================= STATE ================= */
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    if (!sessionId) {
      toast.error("Please join the table first");
      navigate(base, { replace: true });
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await Axios(customerApi.order.listBySession(sessionId));
        setOrders(res.data?.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [sessionId, navigate, base]);

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Your Orders</h1>
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          You haven’t placed any orders yet.
        </div>

        <button
          onClick={() => navigate(base + "/menu")}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  /* ================= MAIN ================= */

  return (
    <div className="pb-24">
      {/* HEADER */}
      <div className="px-4 pt-4 pb-3 sticky top-0 bg-white z-10 border-b">
        <h1 className="text-xl font-semibold">Your Orders</h1>
        <p className="text-sm text-gray-500">
          Track your order status in real-time
        </p>
      </div>

      {/* ORDERS */}
      <div className="px-4 space-y-4 mt-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border rounded-xl overflow-hidden"
          >
            {/* ORDER HEADER */}
            <div className="p-4 flex justify-between items-center border-b">
              <div>
                <p className="text-sm font-semibold">
                  Order #{order.orderNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  order.orderStatus === "OPEN"
                    ? "bg-amber-100 text-amber-700"
                    : order.orderStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            {/* ITEMS */}
            <div className="divide-y">
              {order.items.map((it) => (
                <div key={it._id} className="p-4 flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{it.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {it.quantity} · {it.itemStatus}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">
                    ₹{Math.round(it.price * it.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="p-4 flex justify-between bg-gray-50">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-semibold">
                ₹{Math.round(order.totalAmount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
