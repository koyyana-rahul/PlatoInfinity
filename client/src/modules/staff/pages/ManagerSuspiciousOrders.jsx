/**
 * Manager Order Approval Dashboard
 * - View all PENDING_APPROVAL orders (large qty fraud detection)
 * - Approve/Reject with socket real-time updates
 * - Shows customer details, table, items, timestamp
 */

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  Loader2,
  AlertTriangle,
  Check,
  X,
  Clock,
  UtensilsCrossed,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

export default function ManagerSuspiciousOrders() {
  const { brandSlug, restaurantSlug, restaurantId } = useParams();
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
    } catch (err) {
      console.error("Failed to fetch suspicious orders:", err);
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
      toast.success("Order approved! Sent to kitchen");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-600">
            Loading orders...
          </p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">All Clear!</h2>
          <p className="text-slate-600 text-sm mb-8">
            No pending orders to approve. All suspicious orders have been
            reviewed.
          </p>
          <button
            onClick={fetchSuspiciousOrders}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Pending Approvals
            </h1>
          </div>
          <p className="text-slate-600 text-sm ml-[52px]">
            {orders.length} order{orders.length > 1 ? "s" : ""} need manager
            review
          </p>
        </div>

        {/* ORDERS GRID */}
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onApprove={() => handleApprove(order._id)}
              onReject={() => handleReject(order._id)}
              isApproving={approving === order._id}
              isRejecting={rejecting === order._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onApprove, onReject, isApproving, isRejecting }) {
  const hasLargeQty = order.items?.some((item) => item.quantity > 10);
  const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0);
  const isIndividual = order.meta?.customerMode === "INDIVIDUAL";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-100">
      {/* TOP: TABLE & CUSTOMER */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Table
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {order.tableName || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Items
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalQty}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Amount
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            ₹{Math.round(order.totalAmount)}
          </p>
        </div>
      </div>

      {/* REASON & CUSTOMER LABEL */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-900 text-sm mb-1">
              Reason: {order.suspiciousReason || "High quantity"}
            </p>
            {isIndividual && order.meta?.customerLabel && (
              <p className="text-[12px] text-amber-800">
                👤 Customer:{" "}
                <span className="font-medium">{order.meta.customerLabel}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="mb-6 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Order Items
        </p>
        {order.items?.map((item, idx) => (
          <div
            key={idx}
            className={`flex justify-between text-[13px] p-2 rounded-lg ${
              item.quantity > 10 ? "bg-red-50 border border-red-100" : ""
            }`}
          >
            <span className="font-semibold text-slate-900">
              {item.name} {item.quantity > 10 && "⚠️"}
            </span>
            <span className="font-bold text-slate-700">x{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* TIMESTAMP */}
      <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-6 pb-6 border-b border-slate-100">
        <Clock size={14} />
        {new Date(order.createdAt).toLocaleString()}
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={isApproving || isRejecting}
          onClick={onReject}
          className="h-12 flex items-center justify-center gap-2 rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-[13px] uppercase tracking-widest"
        >
          {isRejecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X size={16} />
          )}
          Reject
        </button>
        <button
          disabled={isApproving || isRejecting}
          onClick={onApprove}
          className="h-12 flex items-center justify-center gap-2 rounded-full border-2 border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-[13px] uppercase tracking-widest"
        >
          {isApproving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Approve
        </button>
      </div>
    </div>
  );
}
