/**
 * ======================================================
 * ADMIN/MANAGER ORDER DASHBOARD
 * ======================================================
 * Real-time order tracking for managers and admins
 */

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import dashboardApi from "../../../api/dashboard.api";
import orderApi from "../../../api/order.api";
import { useSocket } from "../../../socket/SocketProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const OrderDashboard = () => {
  const socket = useSocket();
  const user = useSelector((state) => state.user);
  const restaurantId = user.restaurantId;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, new, in-progress, ready, served
  const [cancellingId, setCancellingId] = useState(null);

  const applyOrderLevelStatusToItems = (items = [], status) => {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "SERVED") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: "SERVED",
      }));
    }

    if (normalized === "CANCELLED") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: item.itemStatus === "SERVED" ? "SERVED" : "CANCELLED",
      }));
    }

    return Array.isArray(items) ? items : [];
  };

  /**
   * 1️⃣ Load initial orders
   */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const config = dashboardApi.getRecentOrders(
          200,
          "today",
          restaurantId || null,
        );
        const res = await Axios({
          url: config.url,
          method: config.method,
          params: config.params,
        });

        if (res.data?.success) {
          const normalized = (res.data.data || []).map((order) => ({
            ...order,
            status: order.orderStatus || order.status || "NEW",
            cancelReason:
              order.cancelReason || order.meta?.cancelReason || null,
            cancelledByRole:
              order.cancelledByRole || order.meta?.cancelledByRole || null,
          }));

          const filteredOrders =
            filter !== "all"
              ? normalized.filter(
                  (order) =>
                    String(
                      order.status || order.orderStatus || "",
                    ).toUpperCase() === String(filter).toUpperCase(),
                )
              : normalized;

          setOrders(filteredOrders);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [restaurantId, filter]);

  /**
   * 2️⃣ Listen for new orders
   */
  useEffect(() => {
    if (!socket) return;

    const handleOrderPlaced = (orderData) => {
      console.log("🆕 New order placed:", orderData);
      toast.success(
        `New Order #${orderData.orderNumber} at Table ${orderData.tableName}`,
        {
          duration: 4,
          icon: "📦",
        },
      );

      // Add to orders list
      setOrders((prev) => [
        {
          _id: orderData.orderId || orderData._id,
          orderNumber: orderData.orderNumber,
          tableName: orderData.tableName,
          totalAmount: Number(orderData.totalAmount || 0),
          itemCount: Number(
            orderData.itemCount || orderData.items?.length || 0,
          ),
          status: orderData.orderStatus || orderData.status || "NEW",
          placedAt: orderData.placedAt,
          items: Array.isArray(orderData.items) ? orderData.items : [],
        },
        ...prev,
      ]);
    };

    socket.on("order:placed", handleOrderPlaced);

    return () => socket.off("order:placed", handleOrderPlaced);
  }, [socket]);

  /**
   * 3️⃣ Listen for item status updates
   */
  useEffect(() => {
    if (!socket) return;

    const handleItemStatusUpdated = (updateData) => {
      console.log("📍 Item status updated:", updateData);

      const targetId = updateData.orderId || updateData._id;

      setOrders((prev) =>
        prev.map((order) =>
          String(order._id) === String(targetId)
            ? {
                ...order,
                status:
                  updateData.orderStatus || updateData.status || order.status,
                itemCount:
                  order.itemCount ||
                  (Array.isArray(order.items) ? order.items.length : 0),
                items: order.items.map((item, idx) =>
                  idx === updateData.itemIndex
                    ? { ...item, itemStatus: updateData.itemStatus }
                    : item,
                ),
              }
            : order,
        ),
      );

      toast.success(`${updateData.itemName} → ${updateData.itemStatus}`, {
        icon: "👨‍🍳",
      });
    };

    socket.on("order:item-status-updated", handleItemStatusUpdated);
    socket.on("order:item-status", handleItemStatusUpdated);

    return () => {
      socket.off("order:item-status-updated", handleItemStatusUpdated);
      socket.off("order:item-status", handleItemStatusUpdated);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderLifecycle = (data) => {
      const targetId = data?.orderId || data?._id;
      if (!targetId) return;

      const incomingStatus =
        data.orderStatus || data.status || data?.orderStatus || data?.status;

      setOrders((prev) =>
        prev.map((order) =>
          String(order._id) === String(targetId)
            ? {
                ...order,
                status: incomingStatus || order.status,
                orderStatus: incomingStatus || order.orderStatus,
                cancelReason:
                  data.reason ||
                  data.cancelReason ||
                  order.cancelReason ||
                  order.meta?.cancelReason ||
                  null,
                cancelledByRole:
                  data.cancelledByRole ||
                  data.meta?.cancelledByRole ||
                  order.cancelledByRole ||
                  order.meta?.cancelledByRole ||
                  null,
                items: applyOrderLevelStatusToItems(
                  order.items || [],
                  incomingStatus,
                ),
              }
            : order,
        ),
      );

      if (data?.status === "READY" || data?.orderStatus === "READY") {
        toast.success(
          `Order #${data.orderNumber || "-"} ready for Table ${data.tableName || "-"}!`,
          {
            duration: 5,
            icon: "✅",
          },
        );
      }
    };

    const events = [
      "order:status-changed",
      "manager:order-status-changed",
      "order:ready-for-serving",
      "order:ready",
      "order:served",
      "order:cancelled",
      "order:updated",
    ];

    events.forEach((eventName) => socket.on(eventName, handleOrderLifecycle));

    return () => {
      events.forEach((eventName) =>
        socket.off(eventName, handleOrderLifecycle),
      );
    };
  }, [socket]);

  /**
   * 5️⃣ Get status color
   */
  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      READY: "bg-green-100 text-green-800",
      SERVED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  /**
   * 6️⃣ Get item status icon
   */
  const getItemStatusIcon = (status) => {
    const icons = {
      NEW: "📝",
      IN_PROGRESS: "👨‍🍳",
      READY: "✅",
      SERVED: "🍽️",
      CANCELLED: "❌",
    };
    return icons[status] || "❓";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  const handleCancelOrder = async (order) => {
    const orderId = order?._id;
    if (!orderId) return;
    const status = String(
      order?.status || order?.orderStatus || "",
    ).toUpperCase();
    if (["CANCELLED", "PAID"].includes(status)) {
      toast.error("Order cannot be cancelled");
      return;
    }

    const confirmed = window.confirm(
      `Cancel Order #${order.orderNumber || ""}?`,
    );
    if (!confirmed) return;

    const reason = window.prompt("Reason for cancellation (optional)") || "";

    try {
      setCancellingId(orderId);
      const res = await Axios({
        ...orderApi.cancelOrder(orderId),
        data: reason ? { reason } : undefined,
      });
      if (res.data?.success) {
        toast.success("Order cancelled");
        setOrders((prev) =>
          prev.map((o) =>
            String(o._id) === String(orderId)
              ? { ...o, status: "CANCELLED", orderStatus: "CANCELLED" }
              : o,
          ),
        );
      } else {
        toast.error(res.data?.message || "Failed to cancel order");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="pb-6 border-b border-gray-200">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            📊 Live Order Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Real-time order tracking and management
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", "NEW", "IN_PROGRESS", "READY", "SERVED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                filter === status
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all"
                style={{ borderLeft: "4px solid #4f46e5" }}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {order.tableName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                  >
                    {order.status || order.orderStatus || "NEW"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-700 pb-4 border-b border-gray-100">
                  <p>
                    <strong>Items:</strong>{" "}
                    {order.itemCount ||
                      (Array.isArray(order.items) ? order.items.length : 0)}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹
                    {Number(order.totalAmount || 0).toFixed(2)}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {new Date(order.placedAt).toLocaleTimeString()}
                  </p>
                  {(order.status === "CANCELLED" ||
                    order.orderStatus === "CANCELLED") && (
                    <p className="text-xs text-red-600 font-semibold">
                      Cancelled by {order.cancelledByRole || "Staff"}
                      {order.cancelReason ? ` • ${order.cancelReason}` : ""}
                    </p>
                  )}
                </div>

                {/* Items Status */}
                {order.items?.length > 0 && (
                  <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-xs text-gray-900 mb-2">
                      Items:
                    </h4>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs flex justify-between items-center text-gray-700"
                        >
                          <span>{item.name}</span>
                          <span>
                            {getItemStatusIcon(item.itemStatus)}{" "}
                            {item.itemStatus}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white py-2.5 rounded-lg text-sm font-semibold transition">
                    View Details
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order)}
                    disabled={cancellingId === order._id}
                    className="w-full bg-white border border-red-200 text-red-600 py-2.5 rounded-lg text-sm font-semibold transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {cancellingId === order._id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">
              Orders will appear here when placed
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDashboard;
