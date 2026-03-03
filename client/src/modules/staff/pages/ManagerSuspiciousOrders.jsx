import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertTriangle,
  Check,
  X,
  Clock,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

export default function ManagerSuspiciousOrders() {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const fetchSuspiciousOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/api/suspicious/manager/suspicious-orders?restaurantId=${restaurantId}`,
      );
      setOrders(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchSuspiciousOrders();
  }, [fetchSuspiciousOrders]);

  const handleApprove = async (orderId) => {
    try {
      setApproving(orderId);
      await axios.post(
        `/api/suspicious/manager/suspicious-orders/${orderId}/approve`,
      );
      toast.success("Order approved");
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (orderId) => {
    try {
      setRejecting(orderId);
      await axios.post(
        `/api/suspicious/manager/suspicious-orders/${orderId}/reject`,
      );
      toast.success("Order rejected");
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed");
    } finally {
      setRejecting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Loading suspicious orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Suspicious Orders
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {orders.length} order{orders.length !== 1 ? "s" : ""} pending
              manager approval
            </p>
          </div>

          <button
            onClick={fetchSuspiciousOrders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-14 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
              <Check size={26} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">All clear</h3>
            <p className="text-sm text-gray-600 mt-1">
              No suspicious orders to review right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const totalQty = order.items?.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              const isIndividual = order.meta?.customerMode === "INDIVIDUAL";

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-lg p-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <Stat label="Table" value={order.tableName || "N/A"} />
                    <Stat label="Items" value={String(totalQty || 0)} />
                    <Stat
                      label="Amount"
                      value={`₹${Math.round(order.totalAmount || 0)}`}
                    />
                  </div>

                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex gap-2 text-amber-800">
                      <AlertTriangle size={18} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">
                          Reason: {order.suspiciousReason || "High quantity"}
                        </p>
                        {isIndividual && order.meta?.customerLabel && (
                          <p className="text-xs mt-1">
                            Customer:{" "}
                            <span className="font-semibold">
                              {order.meta.customerLabel}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 space-y-2">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex justify-between text-sm p-2 rounded-lg ${
                          item.quantity > 10
                            ? "bg-red-50 border border-red-200"
                            : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                        <span className="font-semibold text-gray-700">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock size={14} />{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={
                        approving === order._id || rejecting === order._id
                      }
                      onClick={() => handleReject(order._id)}
                      className="h-10 flex items-center justify-center gap-2 rounded-lg border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
                    >
                      {rejecting === order._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X size={15} />
                      )}
                      Reject
                    </button>
                    <button
                      disabled={
                        approving === order._id || rejecting === order._id
                      }
                      onClick={() => handleApprove(order._id)}
                      className="h-10 flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {approving === order._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check size={15} />
                      )}
                      Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
