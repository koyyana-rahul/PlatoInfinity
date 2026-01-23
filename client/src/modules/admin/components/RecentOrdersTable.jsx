import React from "react";

/**
 * Format order timestamp to readable date and time format
 */
const formatOrderTime = (timestamp) => {
  if (!timestamp) return "-";

  try {
    // Handle different timestamp formats
    let date;

    // If it's already a Date object
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      // Try parsing as ISO string or milliseconds
      date = new Date(timestamp);
    } else {
      return "-";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", timestamp);
      return "-";
    }

    // Format date
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    // Format time
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error("❌ Error formatting time:", e, "Timestamp:", timestamp);
    return "-";
  }
};

/**
 * Recent Orders Table Component
 * Displays list of recent orders with status badges
 */
export const RecentOrdersTable = ({ orders, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-slate-100 rounded animate-pulse w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-500">No orders yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
      <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Order #
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Branch
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Table
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-bold text-slate-900">
                    #{order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {order.restaurantId?.name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {order.tableName || "Takeaway"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                    ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <OrderStatusBadge status={order.orderStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {order.createdAt
                      ? formatOrderTime(order.createdAt)
                      : order.updatedAt
                        ? formatOrderTime(order.updatedAt)
                        : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * Order Status Badge Component
 * Shows colored badge based on order status
 */
const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    NEW: { bg: "bg-red-100", text: "text-red-700" },
    IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700" },
    READY: { bg: "bg-green-100", text: "text-green-700" },
    DELIVERED: { bg: "bg-blue-100", text: "text-blue-700" },
    CANCELLED: { bg: "bg-slate-100", text: "text-slate-700" },
  };

  const config = statusConfig[status] || statusConfig.NEW;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${config.bg} ${config.text}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
};
