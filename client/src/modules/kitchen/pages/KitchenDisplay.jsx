/**
 * KitchenDisplay.jsx
 *
 * Complete kitchen display system:
 * - Real-time orders (no pricing)
 * - Item status tracking
 * - Urgency indication
 * - Station filtering
 * - Notification sounds
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useKitchenDisplay from "../../hooks/useKitchenDisplay";

const STATUS_COLORS = {
  NEW: "bg-red-100 text-red-900 border-red-300",
  IN_PROGRESS: "bg-blue-100 text-blue-900 border-blue-300",
  READY: "bg-green-100 text-green-900 border-green-300",
  SERVED: "bg-gray-100 text-gray-900 border-gray-300",
  CANCELLED: "bg-yellow-100 text-yellow-900 border-yellow-300",
};

const STATUS_ICONS = {
  NEW: "🆕",
  IN_PROGRESS: "👨‍🍳",
  READY: "✅",
  SERVED: "🚚",
  CANCELLED: "❌",
};

export default function KitchenDisplay() {
  const { restaurantId } = useParams();
  const [stationFilter, setStationFilter] = useState(null);
  const [stations, setStations] = useState([]);

  const {
    orders,
    loading,
    updatingOrder,
    socketReady,
    fetchKitchenOrders,
    updateItemStatus,
  } = useKitchenDisplay(restaurantId, stationFilter);

  /* ========== EXTRACT UNIQUE STATIONS ========== */
  useEffect(() => {
    const uniqueStations = new Set();
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.station) {
          uniqueStations.add(item.station);
        }
      });
    });
    setStations(Array.from(uniqueStations).sort());
  }, [orders]);

  /* ========== HANDLE STATUS UPDATE ========== */
  const handleStatusChange = async (orderId, itemIndex, newStatus) => {
    const success = await updateItemStatus(orderId, itemIndex, newStatus);
    if (success) {
      toast.success(`Item marked as ${newStatus}`);
    }
  };

  if (loading && !orders.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300 font-medium">
            Loading kitchen orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen">
      {/* ========== HEADER ========== */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kitchen Display</h1>
            <p className="text-sm text-slate-400 mt-1">
              {socketReady ? "🟢 Live" : "🔴 Offline"} • {orders.length} active
              orders
            </p>
          </div>

          <button
            onClick={fetchKitchenOrders}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* ========== STATION FILTER ========== */}
        {stations.length > 0 && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setStationFilter(null)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                stationFilter === null
                  ? "bg-orange-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              All Stations
            </button>
            {stations.map((station) => (
              <button
                key={station}
                onClick={() => setStationFilter(station)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  stationFilter === station
                    ? "bg-orange-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {station}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========== EMPTY STATE ========== */}
      {orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🧑‍🍳</span>
            </div>
            <p className="text-slate-300 font-medium">No active orders</p>
            <p className="text-slate-500 text-sm mt-1">
              Orders will appear here when customers place them
            </p>
          </div>
        </div>
      ) : (
        /* ========== ORDERS GRID ========== */
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-slate-800 border-2 border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors"
            >
              {/* ========== ORDER HEADER ========== */}
              <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Table</p>
                  <p className="text-2xl font-bold text-white">
                    {order.tableNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Order Age</p>
                  <p className="text-lg font-bold text-slate-100">
                    {order.orderAge}m
                  </p>
                </div>
                {order.priority === "URGENT" && (
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>

              {/* ========== ORDER ITEMS ========== */}
              <div className="divide-y divide-slate-700">
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-4 space-y-2">
                    {/* Item name and quantity */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {item.quantity}x {item.name}
                        </p>

                        {/* Modifiers */}
                        {item.modifiers?.length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            {item.modifiers.map((m) => m.name).join(", ")}
                          </p>
                        )}

                        {/* Special notes */}
                        {item.notes && (
                          <p className="text-xs text-yellow-400 mt-2 bg-yellow-900/20 px-2 py-1 rounded">
                            📝 {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <span
                        className={`text-xl whitespace-nowrap flex-shrink-0`}
                      >
                        {STATUS_ICONS[item.status]}
                      </span>
                    </div>

                    {/* ========== STATUS BUTTONS ========== */}
                    <div className="flex gap-2 flex-wrap">
                      {["IN_PROGRESS", "READY", "SERVED", "CANCELLED"].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() =>
                              handleStatusChange(
                                order.orderId,
                                itemIndex,
                                status,
                              )
                            }
                            disabled={
                              updatingOrder === order.orderId ||
                              item.status === "SERVED"
                            }
                            className={`text-xs px-3 py-1 rounded-lg font-medium transition-all border ${
                              item.status === status
                                ? STATUS_COLORS[status]
                                : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {status === "IN_PROGRESS"
                              ? "Cooking"
                              : status === "READY"
                                ? "Ready"
                                : status === "SERVED"
                                  ? "Served"
                                  : "Cancel"}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ========== ORDER FOOTER ========== */}
              <div className="bg-slate-700/50 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
                <span>{order.items.length} items</span>
                <span>Priority: {order.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== FLOATING STATUS ========== */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300">
        {socketReady ? (
          <>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live Updates Active</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Polling Every 30s</span>
          </>
        )}
      </div>
    </div>
  );
}
