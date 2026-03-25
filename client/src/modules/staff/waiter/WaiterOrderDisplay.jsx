/**
 * ======================================================
 * WAITER ORDER DISPLAY (v2 - Real-time)
 * ======================================================
 * Shows table orders with real-time updates for waiters
 *
 * Features:
 * - Real-time order updates via WebSockets.
 * - Smooth UI updates without full reloads.
 * - Toast notifications for key events.
 * - Cleaner, more efficient state management.
 */

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import SummaryApi from "../../../api/summaryApi";
import { useSocket } from "../../../socket/SocketProvider";

const WaiterOrderDisplay = () => {
  const socket = useSocket();
  const user = useSelector((state) => state.user);
  const restaurantId = user.restaurantId;

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableOrders, setSelectedTableOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * 1️⃣ Load initial data: tables with active sessions
   */
  const loadTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await Axios({
        ...SummaryApi.getTables,
        params: { restaurantId, status: "OCCUPIED" },
      });
      if (res.data?.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error("Error loading tables:", err);
      toast.error("Failed to load tables.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    if (!socket || !restaurantId) return;

    const joinRooms = () => {
      socket.emit("join:restaurant", { restaurantId });
    };

    joinRooms();
    socket.on("connect", joinRooms);

    return () => {
      socket.off("connect", joinRooms);
    };
  }, [socket, restaurantId]);

  /**
   * 2️⃣ Load orders for the selected table
   */
  const loadTableOrders = useCallback(async () => {
    if (!selectedTable) return;

    try {
      const res = await Axios({
        url: `/api/order/session/${selectedTable.sessionId}`,
      });
      if (res.data?.success) {
        setSelectedTableOrders(res.data.data);
      } else {
        toast.error(`Failed to load orders for ${selectedTable.tableName}`);
      }
    } catch (err) {
      console.error("Error loading table orders:", err);
    }
  }, [selectedTable]);

  useEffect(() => {
    loadTableOrders();
  }, [loadTableOrders]);

  /**
   * 3️⃣ Centralized WebSocket Event Handling
   */
  useEffect(() => {
    if (!socket) return;

    // A. New order placed
    const handleOrderPlaced = (order) => {
      console.log("🆕 New order received:", order);
      toast.success(`New order at Table ${order.tableName}`, { icon: "📦" });

      // If it's for the selected table, add it to the view
      if (selectedTable && order.tableId === selectedTable._id) {
        setSelectedTableOrders((prev) => [...prev, order]);
      } else {
        // Otherwise, mark the table as having new orders
        setTables((prev) =>
          prev.map((t) =>
            t._id === order.tableId ? { ...t, hasNewOrders: true } : t,
          ),
        );
      }
    };

    // B. Item status changed (claimed, ready, served, etc.)
    const handleItemStatusUpdate = (update) => {
      console.log("📍 Item status changed:", update);
      setSelectedTableOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id !== update.orderId) return order;

          const updatedItems = order.items.map((item) =>
            item._id === update.itemId
              ? { ...item, itemStatus: update.itemStatus }
              : item,
          );

          return {
            ...order,
            items: updatedItems,
            orderStatus: update.orderStatus,
          };
        }),
      );

      // Notify waiter if item is ready or served
      if (update.itemStatus === "READY") {
        toast.success(
          `${update.itemName} is ready for Table ${update.tableName}!`,
          { icon: "✅" },
        );
      } else if (update.itemStatus === "SERVED") {
        toast.info(`${update.itemName} served at Table ${update.tableName}`, {
          icon: "🍽️",
        });
      }
    };

    // C. Entire order is ready for pickup
    const handleOrderReady = (order) => {
      console.log("✅ Order ready:", order);
      toast.success(`Order #${order.orderNumber} is ready for pickup!`, {
        icon: "🔔",
      });

      setTables((prev) =>
        prev.map((t) =>
          t._id === order.tableId ? { ...t, readyOrders: true } : t,
        ),
      );
    };

    // D. Order is fully served
    const handleOrderServed = (order) => {
      console.log("🍽️ Order served:", order);
      // Optionally remove from view or mark as complete
      setSelectedTableOrders((prev) =>
        prev.map((o) =>
          o._id === order.orderId ? { ...o, orderStatus: "SERVED" } : o,
        ),
      );
    };

    // E. Order is cancelled
    const handleOrderCancelled = (order) => {
      console.log("❌ Order cancelled:", order);
      toast.error(`Order #${order.orderNumber} was cancelled.`);
      setSelectedTableOrders((prev) =>
        prev.map((o) =>
          o._id === order.orderId ? { ...o, orderStatus: "CANCELLED" } : o,
        ),
      );
    };

    // F. Table status changes
    const handleTableStatusChange = ({ tableId, status }) => {
      if (status === "AVAILABLE") {
        setTables((prev) => prev.filter((t) => t._id !== tableId));
        if (selectedTable?._id === tableId) {
          setSelectedTable(null);
        }
      }
    };

    // Subscribe to events
    socket.on("order:placed", handleOrderPlaced);
    socket.on("order:item-status-updated", handleItemStatusUpdate);
    socket.on("order:ready-for-serving", handleOrderReady);
    socket.on("order:served", handleOrderServed);
    socket.on("order:cancelled", handleOrderCancelled);
    socket.on("table:status-changed", handleTableStatusChange);
    socket.on("connect", loadTableOrders); // Reload on reconnect

    // Unsubscribe on cleanup
    return () => {
      socket.off("order:placed", handleOrderPlaced);
      socket.off("order:item-status-updated", handleItemStatusUpdate);
      socket.off("order:ready-for-serving", handleOrderReady);
      socket.off("order:served", handleOrderServed);
      socket.off("order:cancelled", handleOrderCancelled);
      socket.off("table:status-changed", handleTableStatusChange);
      socket.off("connect", loadTableOrders);
    };
  }, [socket, selectedTable, loadTableOrders]);

  /**
   * 4️⃣ Serve item handler
   */
  const handleServeItem = (orderId, itemId, itemName) => {
    socket.emit("waiter:serve-item", { orderId, itemId }, (ack) => {
      if (ack.ok) {
        toast.success(`${itemName} marked as SERVED!`);
      } else {
        toast.error(ack.error || "Failed to serve item.");
      }
    });
  };

  /**
   * 7️⃣ Item status badge color
   */
  const getItemStatusBg = (status) => {
    const colors = {
      NEW: "bg-blue-100",
      IN_PROGRESS: "bg-yellow-100",
      READY: "bg-green-100",
      SERVED: "bg-gray-100",
      CANCELLED: "bg-red-100",
    };
    return colors[status] || "bg-gray-100";
  };

  const getItemStatusText = (status) => {
    const colors = {
      NEW: "text-blue-800",
      IN_PROGRESS: "text-yellow-800",
      READY: "text-green-800",
      SERVED: "text-gray-800",
      CANCELLED: "text-red-800",
    };
    return colors[status] || "text-gray-800";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🍽️ Waiter - Table Orders</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4">📍 Active Tables</h2>

            {loading ? (
              <p className="text-gray-500 text-center py-4">
                Loading tables...
              </p>
            ) : (
              <div className="space-y-2">
                {tables.length > 0 ? (
                  tables.map((table) => (
                    <button
                      key={table._id}
                      onClick={() => setSelectedTable(table)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedTable?._id === table._id
                          ? "bg-blue-500 text-white border-blue-600"
                          : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                      } ${table.readyOrders ? "ring-2 ring-green-500" : ""}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{table.tableName}</span>
                        {table.readyOrders && (
                          <span className="text-lg">✅</span>
                        )}
                      </div>
                      <p className="text-xs opacity-75">Orders pending</p>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No active tables
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Table Orders */}
        <div className="lg:col-span-2">
          {selectedTable ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">
                Table {selectedTable.tableName} - Orders
              </h2>

              {selectedTableOrders.length > 0 ? (
                <div className="space-y-4">
                  {selectedTableOrders.map((order) => (
                    <div
                      key={order._id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">
                            Order #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{order.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg flex justify-between items-center ${getItemStatusBg(
                              item.itemStatus,
                            )}`}
                          >
                            <div>
                              <p
                                className={`font-medium ${getItemStatusText(item.itemStatus)}`}
                              >
                                {item.name} (x{item.quantity})
                              </p>
                            </div>

                            <div className="flex gap-2 items-center">
                              <span
                                className={`px-3 py-1 rounded text-xs font-bold ${getItemStatusText(
                                  item.itemStatus,
                                )}`}
                              >
                                {item.itemStatus}
                              </span>

                              {/* Serve Button */}
                              {item.itemStatus === "READY" && (
                                <button
                                  onClick={() =>
                                    handleServeItem(order._id, idx, item.name)
                                  }
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                  Serve
                                </button>
                              )}

                              {item.itemStatus === "SERVED" && (
                                <span className="text-green-600 font-bold">
                                  ✅ Served
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* All Served */}
                      {order.items.every((i) => i.itemStatus === "SERVED") && (
                        <div className="mt-3 p-3 bg-green-100 text-green-800 rounded text-center font-semibold">
                          ✅ All items served
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No orders for this table
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">
                Select a table to view orders
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterOrderDisplay;
