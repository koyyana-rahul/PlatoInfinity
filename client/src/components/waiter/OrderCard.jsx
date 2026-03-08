import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../api/axios";

export default function OrderCard({ order }) {
  const [servingItemId, setServingItemId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleServeClick = (itemId) => {
    setServingItemId(itemId);
    setShowConfirmModal(true);
  };

  const confirmServe = async () => {
    try {
      const res = await Axios({
        url: `/api/waiter/order/${order._id}/item/${servingItemId}/serve`,
        method: "POST",
        data: { staffPin: null }, // No PIN required
      });
      if (res.data?.success) {
        toast.success("Item marked as served");
        setShowConfirmModal(false);
        setServingItemId(null);
        // Socket listener will update the order list in real-time
      } else {
        toast.error(res.data?.message || "Failed to serve");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Serve failed");
    }
  };

  // Create a stable key that includes item statuses so React re-renders when any item changes
  const cardKey = `${order._id}-${order.items.map(it => it.itemStatus).join(",")}`;

  // Derive order-level status from highest item status
  const getOrderStatus = () => {
    if (!order.items || order.items.length === 0) return "PLACED";
    const statuses = order.items.map(it => String(it.itemStatus || "NEW").toUpperCase());
    if (statuses.some(s => s === "SERVING")) return "SERVING";
    if (statuses.some(s => s === "SERVED")) return "SERVED";
    if (statuses.some(s => s === "READY")) return "READY";
    if (statuses.some(s => s === "IN_PROGRESS")) return "PREPARING";
    return "PLACED";
  };

  // Get color and style for order status badge
  const getStatusBadgeStyle = (status) => {
    const base = "text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wide";
    switch (status) {
      case "PLACED":
      case "NEW":
        return `${base} bg-slate-100 text-slate-700 border-slate-200`;
      case "SERVING":
        return `${base} bg-blue-100 text-blue-700 border-blue-200`;
      case "PREPARING":
        return `${base} bg-amber-100 text-amber-700 border-amber-200`;
      case "READY":
        return `${base} bg-green-100 text-green-700 border-green-200`;
      case "SERVED":
        return `${base} bg-green-100 text-green-700 border-green-200`;
      default:
        return `${base} bg-gray-100 text-gray-700 border-gray-200`;
    }
  };

  const orderStatus = getOrderStatus();
  return (
    <div key={cardKey} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">
            Table {order.tableName || "-"}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <span className={getStatusBadgeStyle(orderStatus)}>
          {orderStatus}
        </span>
      </div>

      <div className="mt-3 divide-y divide-gray-100">
        {order.items.map((item) => (
          <div key={item._id} className="py-2 flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">
                Qty {item.quantity} · {item.itemStatus}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-900">
                ₹{item.price * item.quantity}
              </p>
              {item.itemStatus === "READY" && (
                <button
                  onClick={() => handleServeClick(item._id)}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold transition"
                >
                  Serve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Confirm Serve</h2>
            <p className="text-sm text-gray-600 mb-6">
              Mark this item as served?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmServe}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
              >
                Serve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
