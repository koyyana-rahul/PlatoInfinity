/**
 * KitchenDisplay.ENHANCED.jsx
 *
 * Enhanced Kitchen Display System - Production Ready
 * ✅ Fully responsive (works on tablets/phones for kitchen staff)
 * ✅ Real-time order tracking
 * ✅ Status management
 * ✅ Error boundaries
 * ✅ Sound alerts
 * ✅ Touch-friendly interface
 *
 * Uses:
 * - ResponsiveContainer: Page wrapper
 * - ResponsiveGrid: Order cards layout
 * - ResponsiveCard: Order display
 * - ErrorBoundary: Error handling
 * - LoadingSpinner: Loading state
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useKitchenDisplay from "../../hooks/useKitchenDisplay";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Filter,
} from "lucide-react";

// NEW: UI Components
import ErrorBoundary from "../../../components/ui/ErrorBoundary";
import ResponsiveContainer from "../../../components/ui/ResponsiveContainer";
import ResponsiveGrid from "../../../components/ui/ResponsiveGrid";
import ResponsiveCard from "../../../components/ui/ResponsiveCard";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import ResponsiveText from "../../../components/ui/ResponsiveText";
import EmptyState from "../../../components/ui/EmptyState";

// Status colors and icons
const STATUS_CONFIG = {
  NEW: {
    label: "New Order",
    color: "bg-red-100 text-red-900 border-red-300",
    icon: "🆕",
    bgCard: "bg-red-50",
    borderCard: "border-red-200",
  },
  IN_PROGRESS: {
    label: "Preparing",
    color: "bg-blue-100 text-blue-900 border-blue-300",
    icon: "👨‍🍳",
    bgCard: "bg-blue-50",
    borderCard: "border-blue-200",
  },
  READY: {
    label: "Ready",
    color: "bg-green-100 text-green-900 border-green-300",
    icon: "✅",
    bgCard: "bg-green-50",
    borderCard: "border-green-200",
  },
  SERVED: {
    label: "Served",
    color: "bg-gray-100 text-gray-900 border-gray-300",
    icon: "🚚",
    bgCard: "bg-gray-50",
    borderCard: "border-gray-200",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-yellow-100 text-yellow-900 border-yellow-300",
    icon: "❌",
    bgCard: "bg-yellow-50",
    borderCard: "border-yellow-200",
  },
};

/**
 * Kitchen Display System - Mobile-friendly order management
 */
export default function KitchenDisplay() {
  const { restaurantId } = useParams();
  const [stationFilter, setStationFilter] = useState(null);
  const [stations, setStations] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const {
    orders,
    loading,
    updatingOrder,
    socketReady,
    fetchKitchenOrders,
    updateItemStatus,
  } = useKitchenDisplay(restaurantId, stationFilter);

  /**
   * Extract unique stations from orders
   */
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

  /**
   * Play sound alert
   */
  const playAlert = () => {
    if (!soundEnabled) return;
    // Use Web Audio API to play a simple beep
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  /**
   * Handle status update for an item
   */
  const handleStatusChange = async (orderId, itemIndex, newStatus) => {
    const success = await updateItemStatus(orderId, itemIndex, newStatus);
    if (success) {
      toast.success(`Item marked as ${newStatus}`);
      if (newStatus === "READY") {
        playAlert();
      }
    }
  };

  /**
   * Handle manual refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchKitchenOrders();
      toast.success("Orders refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Get next status
   */
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      NEW: "IN_PROGRESS",
      IN_PROGRESS: "READY",
      READY: "SERVED",
      SERVED: "SERVED",
      CANCELLED: "CANCELLED",
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  // 🔴 LOADING STATE
  if (loading && !orders.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4">
        <LoadingSpinner size="lg" message="Loading Kitchen Orders..." />
      </div>
    );
  }

  // ✅ MAIN CONTENT
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-md border-b border-slate-700 px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <ResponsiveText variant="heading2" className="text-white">
                Kitchen Display
              </ResponsiveText>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {socketReady ? "🟢 Live" : "🔴 Offline"} • {orders.length}{" "}
                active orders
              </p>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex flex-wrap gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`h-10 sm:h-12 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 ${
                  soundEnabled
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                }`}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="hidden sm:inline">
                  {soundEnabled ? "Sound On" : "Sound Off"}
                </span>
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-10 sm:h-12 px-3 sm:px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </header>

        {/* STATION FILTER */}
        {stations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-3 sm:py-4"
          >
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Filter size={18} className="text-slate-400 flex-shrink-0" />
              <button
                onClick={() => setStationFilter(null)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  stationFilter === null
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                }`}
              >
                All Stations
              </button>
              {stations.map((station) => (
                <button
                  key={station}
                  onClick={() => setStationFilter(station)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                    stationFilter === station
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
                >
                  {station}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ORDERS GRID */}
        <ResponsiveContainer className="py-6 sm:py-8">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-12"
            >
              <EmptyState
                icon={CheckCircle2}
                title="All Orders Complete!"
                message="No pending orders. Great work team!"
              />
            </motion.div>
          ) : (
            <ResponsiveGrid cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {orders.map((order, idx) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ResponsiveCard
                      className={`${STATUS_CONFIG[order.orderStatus]?.bgCard} border-2 ${STATUS_CONFIG[order.orderStatus]?.borderCard}`}
                    >
                      {/* Order Header */}
                      <div className="mb-4 pb-4 border-b border-slate-300/30">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm font-bold text-slate-900 mt-1">
                              {order.tableName || "Takeaway"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${STATUS_CONFIG[order.orderStatus]?.color}`}
                          >
                            {STATUS_CONFIG[order.orderStatus]?.icon}{" "}
                            {STATUS_CONFIG[order.orderStatus]?.label}
                          </span>
                        </div>

                        {/* Timer */}
                        {order.orderStatus !== "SERVED" && (
                          <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                            <Clock size={14} />
                            <span>
                              {Math.floor(
                                (new Date() - new Date(order.placedAt)) / 60000,
                              )}{" "}
                              min
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        {order.items?.map((item, itemIdx) => {
                          const itemStatus = item.status || "NEW";
                          const itemConfig = STATUS_CONFIG[itemStatus];

                          return (
                            <motion.div
                              key={itemIdx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 + itemIdx * 0.05 }}
                              className="p-3 bg-white/50 rounded-lg border border-slate-300/50"
                            >
                              {/* Item Name & Quantity */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900">
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                              </div>

                              {/* Item Status */}
                              <div className="flex items-center gap-2 mb-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-semibold ${itemConfig?.color}`}
                                >
                                  {itemConfig?.icon} {itemConfig?.label}
                                </span>
                              </div>

                              {/* Status Buttons */}
                              {itemStatus !== "SERVED" &&
                                itemStatus !== "CANCELLED" && (
                                  <div className="flex gap-2">
                                    {itemStatus === "NEW" && (
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            order._id,
                                            itemIdx,
                                            "IN_PROGRESS",
                                          )
                                        }
                                        disabled={updatingOrder}
                                        className="flex-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded text-xs font-bold transition-colors"
                                      >
                                        Start
                                      </button>
                                    )}

                                    {itemStatus === "IN_PROGRESS" && (
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            order._id,
                                            itemIdx,
                                            "READY",
                                          )
                                        }
                                        disabled={updatingOrder}
                                        className="flex-1 px-2 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded text-xs font-bold transition-colors"
                                      >
                                        Ready
                                      </button>
                                    )}

                                    {itemStatus === "READY" && (
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            order._id,
                                            itemIdx,
                                            "SERVED",
                                          )
                                        }
                                        disabled={updatingOrder}
                                        className="flex-1 px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded text-xs font-bold transition-colors"
                                      >
                                        Served
                                      </button>
                                    )}
                                  </div>
                                )}
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Order Complete Check */}
                      {order.items?.every(
                        (item) => item.status === "SERVED",
                      ) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 pt-4 border-t border-slate-300/30 text-center"
                        >
                          <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} />
                            All items served
                          </p>
                        </motion.div>
                      )}
                    </ResponsiveCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ResponsiveGrid>
          )}
        </ResponsiveContainer>
      </div>
    </ErrorBoundary>
  );
}
