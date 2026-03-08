/**
 * ======================================================
 * CHEF KITCHEN QUEUE DISPLAY
 * ======================================================
 * Real-time kitchen station queue for chefs
 */

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import SummaryApi from "../../../api/summaryApi";
import { useSocket } from "../../../socket/SocketProvider";

const KitchenQueueDisplay = () => {
  const socket = useSocket();
  const user = useSelector((state) => state.user);
  const restaurantId = user.restaurantId;
  const station = user.station;

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, claimed, ready

  /**
   * 1️⃣ Load station queue
   */
  useEffect(() => {
    const loadQueue = async () => {
      try {
        setLoading(true);
        const res = await Axios({
          url: `/api/kitchen/orders`,
          params: { station, filter },
        });

        if (res.data?.success) {
          setQueue(res.data.data);
        }
      } catch (err) {
        console.error("Error loading kitchen queue:", err);
        toast.error("Failed to load kitchen queue");
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, [station, filter]);

  /**
   * 2️⃣ Listen for new orders
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("kitchen:order-new", (orderData) => {
      console.log("🆕 New order in kitchen:", orderData);

      // Add new items to queue
      const newItems = orderData.items.map((item) => ({
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        tableName: orderData.tableName,
        itemName: item.name,
        quantity: item.quantity,
        station: item.station,
        status: "NEW",
        placedAt: new Date(),
        itemId: item._id, // store item _id for API calls
      }));

      setQueue((prev) => [...newItems, ...prev]);

      // Sound notification
      playNotificationSound();

      toast.success(
        `📦 Order #${orderData.orderNumber} at ${orderData.tableName}`,
        {
          duration: 4,
          icon: "🔔",
        },
      );
    });

    return () => socket.off("kitchen:order-new");
  }, [socket]);

  /**
   * 3️⃣ Listen for item status updates (real-time sync)
   */
  useEffect(() => {
    if (!socket) return;

    const handleItemStatusUpdate = (data) => {
      console.log("📶 Kitchen: item status update", data);
      const { orderId, itemId, itemName, itemStatus, chefName } = data;
      setQueue((prev) =>
        prev.map((item) =>
          item.orderId === orderId && (item.itemName === itemName || String(item.itemId) === String(itemId))
            ? { ...item, status: itemStatus, claimedBy: chefName }
            : item,
        ),
      );
    };

    socket.on("order:item-status-updated", handleItemStatusUpdate);
    // Fallback
    socket.on("order:item-status", handleItemStatusUpdate);

    return () => {
      socket.off("order:item-status-updated", handleItemStatusUpdate);
      socket.off("order:item-status", handleItemStatusUpdate);
    };
  }, [socket]);

  /**
   * 3️⃣ Listen for item claimed
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("kitchen:item-claimed", (data) => {
      console.log("👨‍🍳 Item claimed:", data);

      setQueue((prev) =>
        prev.map((item) =>
          item.orderId === data.orderId && item.itemName === data.itemName
            ? { ...item, status: "IN_PROGRESS", claimedBy: data.chefName }
            : item,
        ),
      );
    });

    return () => socket.off("kitchen:item-claimed");
  }, [socket]);

  /**
   * 4️⃣ Listen for order cancelled
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("kitchen:order-cancelled", (data) => {
      console.log("❌ Order cancelled:", data);

      setQueue((prev) => prev.filter((item) => item.orderId !== data.orderId));

      toast.error(`Order #${data.orderNumber} cancelled`, {
        icon: "❌",
      });
    });

    return () => socket.off("kitchen:order-cancelled");
  }, [socket]);

  /**
   * 5️⃣ Play notification sound
   */
  const playNotificationSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==",
    );
    audio.play().catch(() => {
      // Fallback - use system notification
    });
  };

  /**
   * 6️⃣ Claim item handler (API)
   */
  const handleClaimItem = async (orderId, itemId, itemName) => {
    try {
      const res = await Axios({
        url: `/api/kitchen/order/${orderId}/item/${itemId}/status`,
        method: "PUT",
        data: { status: "PREPARING" },
      });
      if (res.data?.success) {
        toast.success(`You started preparing ${itemName}`);
        // Socket listener will update the queue; optimistic update optional
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to claim item");
    }
  };

  /**
   * 7️⃣ Mark ready handler (API)
   */
  const handleMarkReady = async (orderId, itemId, itemName) => {
    try {
      const res = await Axios({
        url: `/api/kitchen/order/${orderId}/item/${itemId}/status`,
        method: "PUT",
        data: { status: "READY" },
      });
      if (res.data?.success) {
        toast.success(`${itemName} is ready!`, { icon: "✅" });
        // Socket listener will update the queue
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark ready");
    }
  };

  /**
   * 8️⃣ Get status color and icon
   */
  const getStatusStyle = (status) => {
    const styles = {
      NEW: {
        bg: "bg-red-100",
        text: "text-red-900",
        icon: "🔴",
        priority: "URGENT",
      },
      IN_PROGRESS: {
        bg: "bg-yellow-100",
        text: "text-yellow-900",
        icon: "🟡",
        priority: "COOKING",
      },
      READY: {
        bg: "bg-green-100",
        text: "text-green-900",
        icon: "🟢",
        priority: "READY",
      },
    };
    return styles[status] || styles.NEW;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">🍳 Kitchen Queue</h1>
          <p className="text-gray-400">
            Station: <span className="font-bold text-white">{station}</span>
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "NEW", "IN_PROGRESS", "READY"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Queue Items */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading queue...</p>
          </div>
        ) : queue.length > 0 ? (
          <div className="space-y-3">
            {queue.map((item, idx) => {
              const style = getStatusStyle(item.status);

              return (
                <div
                  key={idx}
                  className={`${style.bg} ${style.text} p-4 rounded-lg shadow-lg border-l-4 border-current`}
                >
                  <div className="flex justify-between items-start mb-3">
                    {/* Left - Item Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">{style.icon}</span>
                        <div>
                          <p className="text-sm font-semibold">
                            {style.priority}
                          </p>
                          <p className="text-2xl font-bold">{item.itemName}</p>
                        </div>
                      </div>
                      <div className="text-sm space-y-1 ml-11">
                        <p>
                          <strong>Order:</strong> #{item.orderNumber}
                        </p>
                        <p>
                          <strong>Table:</strong> {item.tableName}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {item.quantity}
                        </p>
                        {item.claimedBy && (
                          <p className="text-xs opacity-75">
                            👨‍🍳 {item.claimedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex gap-2">
                      {item.status === "NEW" && (
                        <button
                          onClick={() =>
                            handleClaimItem(item.orderId, item.itemId, item.itemName)
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition transform hover:scale-105"
                        >
                          Claim
                        </button>
                      )}

                      {item.status === "IN_PROGRESS" && (
                        <button
                          onClick={() =>
                            handleMarkReady(item.orderId, item.itemId, item.itemName)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition transform hover:scale-105"
                        >
                          Ready
                        </button>
                      )}

                      {item.status === "READY" && (
                        <span className="text-2xl">✅</span>
                      )}
                    </div>
                  </div>

                  {/* Time indicator */}
                  <div className="text-xs opacity-75 text-right">
                    {new Date(item.placedAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-xl">
              🎉 Queue is empty! Great job!
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-red-100 text-red-900 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">
              {queue.filter((i) => i.status === "NEW").length}
            </p>
            <p className="text-sm">New Orders</p>
          </div>
          <div className="bg-yellow-100 text-yellow-900 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">
              {queue.filter((i) => i.status === "IN_PROGRESS").length}
            </p>
            <p className="text-sm">Cooking</p>
          </div>
          <div className="bg-green-100 text-green-900 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">
              {queue.filter((i) => i.status === "READY").length}
            </p>
            <p className="text-sm">Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenQueueDisplay;
