import React from "react";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";

/**
 * Order Status Timeline
 */
const OrderStatusTimeline = ({ order }) => {
  const statuses = [
    { key: "OPEN", label: "Order Placed", icon: FiClock },
    { key: "PENDING_APPROVAL", label: "Pending", icon: FiAlertCircle },
    { key: "APPROVED", label: "Approved", icon: FiCheckCircle },
    { key: "PAID", label: "Completed", icon: FiCheckCircle },
  ];

  const currentIndex = statuses.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="flex items-center gap-2">
      {statuses.map((status, idx) => {
        const Icon = status.icon;
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={status.key} className="flex items-center">
            <div
              className={`p-2 rounded-full ${
                isCompleted || isCurrent
                  ? "bg-green-100 text-green-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Icon size={16} />
            </div>
            {idx < statuses.length - 1 && (
              <div
                className={`w-4 h-0.5 ${
                  isCompleted ? "bg-green-600" : "bg-slate-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Active Orders Card
 */
const ActiveOrderCard = ({ order }) => {
  const getUrgency = (createdAt) => {
    const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
    if (mins > 20) return "high";
    if (mins > 10) return "medium";
    return "low";
  };

  const urgency = getUrgency(order.createdAt);
  const urgencyColors = {
    high: "bg-red-100 border-red-300",
    medium: "bg-yellow-100 border-yellow-300",
    low: "bg-green-100 border-green-300",
  };

  return (
    <div
      className={`border rounded-lg p-4 ${urgencyColors[urgency]} hover:shadow-md transition-shadow`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-slate-900">Order #{order.orderNumber}</p>
          <p className="text-xs text-slate-600 mt-1">
            {order.tableName || "Takeaway"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900">
            ₹{order.totalAmount?.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-600">
            {order.items?.length || 0} items
          </p>
        </div>
      </div>

      <OrderStatusTimeline order={order} />

      <div className="mt-3 pt-3 border-t border-slate-300">
        <p className="text-xs text-slate-600">
          Status: <span className="font-semibold">{order.orderStatus}</span>
        </p>
      </div>
    </div>
  );
};

/**
 * Real-Time Order Tracking Component
 */
export const RealTimeOrderTracking = ({ activeOrders = [], loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const sortedOrders = [...activeOrders]
    .filter((o) => !["PAID", "CANCELLED"].includes(o.orderStatus))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <FiTrendingUp className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-slate-900">Active Orders</h3>
        <span className="ml-auto text-xs font-semibold text-slate-600 bg-blue-100 px-2 py-1 rounded-full">
          {sortedOrders.length} {sortedOrders.length === 1 ? "order" : "orders"}
        </span>
      </div>

      {sortedOrders.length > 0 ? (
        <div className="space-y-2">
          {sortedOrders.map((order) => (
            <ActiveOrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <FiCheckCircle className="text-green-600 mx-auto mb-2" size={32} />
          <p className="text-sm text-slate-600">No active orders</p>
        </div>
      )}
    </div>
  );
};
