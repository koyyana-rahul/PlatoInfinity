/**
 * ======================================================
 * WAITER ORDER DISPLAY
 * ======================================================
 * Shows table orders with real-time updates for waiters
 */

import { useState, useEffect } from "react";
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
   * 1️⃣ Load tables and active orders
   */
  useEffect(() => {
    const loadTables = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [restaurantId]);

  /**
   * 2️⃣ Load orders for selected table
   */
  useEffect(() => {
    if (!selectedTable) return;

    const loadTableOrders = async () => {
      try {
        const res = await Axios({
          url: `/api/order/session/${selectedTable.sessionId}`,
        });

        if (res.data?.success) {
          setSelectedTableOrders(res.data.data);
        }
      } catch (err) {
        console.error("Error loading table orders:", err);
      }
    };

    loadTableOrders();
  }, [selectedTable]);

  /**
   * 3️⃣ Listen for new orders at tables
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("table:order-placed", (orderData) => {
      console.log("🆕 New order at table:", orderData);
      toast.success(
        `New order at Table ${orderData.tableName}: ${orderData.itemCount} items`,
        { icon: "📦", duration: 4 },
      );

      // Update tables list
      setTables((prev) =>
        prev.map((table) =>
          table._id === orderData.tableId
            ? { ...table, hasNewOrders: true }
            : table,
        ),
      );
    });

    return () => socket.off("table:order-placed");
  }, [socket]);

  /**
   * 4️⃣ Listen for items ready
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("table:item-status-changed", (data) => {
      console.log("📍 Item status changed:", data);

      if (data.itemStatus === "READY") {
        toast.success(
          `${data.itemName} is ready for Table ${data.tableName}!`,
          {
            icon: "✅",
            duration: 5,
          },
        );
      }

      // Update selected table orders
      if (selectedTable?._id === data.tableId) {
        setSelectedTableOrders((prev) =>
          prev.map((order) =>
            order._id === data.orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.name === data.itemName
                      ? { ...item, itemStatus: data.itemStatus }
                      : item,
                  ),
                }
              : order,
          ),
        );
      }
    });

    return () => socket.off("table:item-status-changed");
  }, [socket, selectedTable]);

  /**
   * 5️⃣ Listen for order ready
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("table:order-ready", (data) => {
      console.log("✅ Order ready at table:", data);

      toast.success(
        `Order #${data.orderNumber} at Table ${data.tableName} is ready!`,
        {
          duration: 5,
          icon: "🔔",
        },
      );

      // Highlight the table
      setTables((prev) =>
        prev.map((table) =>
          table._id === data.tableId ? { ...table, readyOrders: true } : table,
        ),
      );
    });

    return () => socket.off("table:order-ready");
  }, [socket]);

  /**
   * 6️⃣ Serve item handler
   */
  const handleServeItem = async (orderId, itemIndex, itemName) => {
    try {
      socket.emit("waiter:serve-item", { orderId, itemIndex }, (response) => {
        if (response.ok) {
          toast.success(`${itemName} served!`);
        } else {
          toast.error(response.error || "Failed to mark as served");
        }
      });
    } catch (err) {
      toast.error("Error serving item");
    }
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
