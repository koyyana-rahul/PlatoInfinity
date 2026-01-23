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
import SummaryApi from "../../../api/summaryApi";
import { useSocket } from "../../../socket/SocketProvider";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const OrderDashboard = () => {
  const socket = useSocket();
  const user = useSelector((state) => state.user);
  const restaurantId = user.restaurantId;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, new, in-progress, ready, served

  /**
   * 1️⃣ Load initial orders
   */
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const res = await Axios({
          ...SummaryApi.getOrders,
          params: {
            restaurantId,
            status: filter !== "all" ? filter : undefined,
          },
        });

        if (res.data?.success) {
          setOrders(res.data.data);
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

    socket.on("order:placed", (orderData) => {
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
          _id: orderData.orderId,
          orderNumber: orderData.orderNumber,
          tableName: orderData.tableName,
          totalAmount: orderData.totalAmount,
          itemCount: orderData.itemCount,
          status: "NEW",
          placedAt: orderData.placedAt,
          items: [],
        },
        ...prev,
      ]);
    });

    return () => socket.off("order:placed");
  }, [socket]);

  /**
   * 3️⃣ Listen for item status updates
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("order:item-status-updated", (updateData) => {
      console.log("📍 Item status updated:", updateData);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === updateData.orderId
            ? {
                ...order,
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
    });

    return () => socket.off("order:item-status-updated");
  }, [socket]);

  /**
   * 4️⃣ Listen for order ready
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("order:ready-for-serving", (data) => {
      console.log("✅ Order ready for serving:", data);

      toast.success(
        `Order #${data.orderNumber} ready for Table ${data.tableName}!`,
        {
          duration: 5,
          icon: "✅",
        },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId ? { ...order, status: "READY" } : order,
        ),
      );
    });

    return () => socket.off("order:ready-for-serving");
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

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">📊 Order Dashboard</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "NEW", "IN_PROGRESS", "READY", "SERVED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border hover:bg-gray-100"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition border-l-4 border-blue-500"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">📍 {order.tableName}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-3 text-sm text-gray-700">
                <p>
                  <strong>Items:</strong> {order.itemCount}
                </p>
                <p>
                  <strong>Total:</strong> ₹{order.totalAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(order.placedAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Items Status */}
              {order.items?.length > 0 && (
                <div className="mb-3 bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-xs mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex justify-between items-center"
                      >
                        <span>{item.name}</span>
                        <span>
                          {getItemStatusIcon(item.itemStatus)} {item.itemStatus}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No orders found</p>
        </div>
      )}
    </div>
  );
};

export default OrderDashboard;
