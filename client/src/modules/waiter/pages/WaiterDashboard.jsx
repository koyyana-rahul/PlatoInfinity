/**
 * Waiter Dashboard - 2026 Savory Modern
 * Real-time table management, order tracking, and bill settlement
 */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../../utils/notify";
import {
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Printer,
  Eye,
  RefreshCw,
  Plus,
  Home,
  TrendingUp,
  Loader2,
  ChefHat,
  Utensils,
} from "lucide-react";

import Axios from "../../../api/axios";
import waiterApi from "../../../api/waiter.api";
import { useSocket } from "../../../socket/SocketProvider";

/**
 * Table status configuration
 */
const TABLE_STATUS_CONFIG = {
  AVAILABLE: {
    label: "Available",
    color: "brand-accent",
    bg: "bg-brand-accent/10",
    dot: "bg-emerald-500",
  },
  OCCUPIED: {
    label: "Occupied",
    color: "brand-primary",
    bg: "bg-brand-primary/10",
    dot: "bg-blue-500",
  },
  WAITING: {
    label: "Waiting",
    color: "brand-cta",
    bg: "bg-brand-cta/10",
    dot: "bg-amber-500",
  },
  ORDERING: {
    label: "Ordering",
    color: "brand-primary",
    bg: "bg-brand-primary/10",
    dot: "bg-purple-500",
  },
  SETTLING: {
    label: "Settling",
    color: "red-500",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
};

export default function WaiterDashboard() {
  const { restaurantSlug } = useParams();
  const auth = useSelector((state) => state.auth);
  const user = auth.user;
  const socket = useSocket();

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  /**
   * Fetch waiter data
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tablesRes, statsRes] = await Promise.all([
        Axios(waiterApi.getWaiterTables()),
        Axios(waiterApi.getWaiterStats()),
      ]);

      if (tablesRes.data?.success) {
        setTables(tablesRes.data.data || []);
      }
      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to load waiter data:", error);
      notify.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (!socket) return;

    const handleLiveUpdate = () => {
      loadData();
    };

    const events = [
      "order:placed",
      "order:item-status-updated",
      "order:status-changed",
      "order:ready",
      "order:served",
      "order:cancelled",
      "table:item-status-changed",
      "table:status-changed",
      "table:status-updated",
      "waiter:item-ready-alert",
    ];

    events.forEach((eventName) => socket.on(eventName, handleLiveUpdate));
    socket.on("connect", handleLiveUpdate);

    return () => {
      events.forEach((eventName) => socket.off(eventName, handleLiveUpdate));
      socket.off("connect", handleLiveUpdate);
    };
  }, [socket, loadData]);

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
      notify.success("Dashboard updated");
    } catch (error) {
      notify.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Update table status
   */
  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      const res = await Axios(waiterApi.updateTableStatus(tableId, newStatus));
      if (res.data?.success) {
        setTables(
          tables.map((t) =>
            t._id === tableId ? { ...t, status: newStatus } : t,
          ),
        );
        notify.success(`Table marked as ${newStatus.toLowerCase()}`);
      }
    } catch (error) {
      notify.error("Failed to update table status");
    }
  };

  /**
   * Print bill
   */
  const handlePrintBill = (tableId) => {
    notify.success("Bill sent to printer");
  };

  /**
   * Filter tables
   */
  const filteredTables = tables.filter((table) => {
    if (filterStatus === "all") return true;
    return table.status === filterStatus;
  });

  /**
   * Calculate stats
   */
  const occupiedCount = tables.filter((t) => t.status !== "AVAILABLE").length;
  const waitingCount = tables.filter((t) => t.status === "WAITING").length;
  const settlingCount = tables.filter((t) => t.status === "SETTLING").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-cta animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-semibold">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* HEADER */}
      <header className="bg-background-secondary border-b border-gray-200 p-4 md:p-6 sticky top-0 z-20 shadow-soft">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                <Utensils size={20} className="text-brand-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  Waiter Dashboard
                </h1>
                <p className="text-xs md:text-sm text-text-light mt-1">
                  Manage tables and track orders
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary gap-2 inline-flex items-center justify-center py-2.5 px-4"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              <span className="hidden md:inline font-semibold">Refresh</span>
            </button>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatCard
              label="Occupied"
              value={occupiedCount}
              icon={Users}
              color="brand-primary"
            />
            <StatCard
              label="Waiting Order"
              value={waitingCount}
              icon={Clock}
              color="brand-cta"
            />
            <StatCard
              label="Settling"
              value={settlingCount}
              icon={DollarSign}
              color="red-500"
            />
            <StatCard
              label="Available"
              value={tables.filter((t) => t.status === "AVAILABLE").length}
              icon={CheckCircle2}
              color="brand-accent"
            />
          </div>

          {/* FILTER TABS */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            {["all", "AVAILABLE", "OCCUPIED", "WAITING", "SETTLING"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                    filterStatus === status
                      ? "bg-brand-cta text-white shadow-card"
                      : "bg-background-tertiary text-text-secondary hover:bg-gray-100"
                  }`}
                >
                  {status === "all" ? "All Tables" : status}
                </button>
              ),
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {filteredTables.length === 0 ? (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="w-24 h-24 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-200">
                <ChefHat size={40} className="text-text-light" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                No tables
              </h2>
              <p className="text-text-secondary text-base max-w-sm">
                {filterStatus === "all"
                  ? "No tables found"
                  : `No tables with status: ${filterStatus}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredTables.map((table) => {
                const config =
                  TABLE_STATUS_CONFIG[table.status] ||
                  TABLE_STATUS_CONFIG.AVAILABLE;
                return (
                  <motion.div
                    key={table._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card p-5 border-l-4 border-l-brand-primary hover:shadow-card-hover transition-all"
                  >
                    {/* TABLE HEADER */}
                    <div
                      className={`${config.bg} px-4 py-3 rounded-lg mb-4 flex items-center justify-between`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-text-light uppercase tracking-wide">
                          Table
                        </p>
                        <p className="text-2xl font-bold text-text-primary mt-1">
                          {table.tableNumber}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${config.dot}`}
                        />
                        <p className="text-xs font-semibold text-text-secondary uppercase">
                          {config.label}
                        </p>
                      </div>
                    </div>

                    {/* TABLE DETAILS */}
                    <div className="space-y-3 mb-5">
                      {table.capacity && (
                        <DetailRow
                          icon={Users}
                          label="Capacity"
                          value={`${table.guestCount || 0}/${table.capacity}`}
                        />
                      )}
                      {table.orderCount > 0 && (
                        <DetailRow
                          icon={Utensils}
                          label="Orders"
                          value={table.orderCount}
                        />
                      )}
                      {table.occupiedSince && (
                        <DetailRow
                          icon={Clock}
                          label="Occupied"
                          value={`${Math.floor((Date.now() - new Date(table.occupiedSince)) / 60000)}m`}
                        />
                      )}
                    </div>

                    {/* SPECIAL NOTES */}
                    {table.notes && (
                      <div className="bg-brand-cta/10 border border-brand-cta/30 rounded-lg p-3 mb-4">
                        <p className="text-xs font-semibold text-brand-cta mb-1">
                          Notes
                        </p>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {table.notes}
                        </p>
                      </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col gap-2.5">
                      {table.status === "AVAILABLE" ? (
                        <button
                          onClick={() =>
                            handleUpdateTableStatus(table._id, "OCCUPIED")
                          }
                          className="btn-primary py-2.5 px-3 text-xs md:text-sm font-semibold"
                        >
                          Assign Table
                        </button>
                      ) : table.status === "OCCUPIED" ? (
                        <>
                          <button
                            onClick={() => setSelectedTable(table)}
                            className="btn-ghost py-2.5 px-3 text-xs md:text-sm font-semibold flex items-center justify-center gap-2"
                          >
                            <Eye size={16} />
                            View Orders
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateTableStatus(table._id, "SETTLING")
                            }
                            className="btn-secondary py-2.5 px-3 text-xs md:text-sm font-semibold"
                          >
                            Call Bill
                          </button>
                        </>
                      ) : table.status === "SETTLING" ? (
                        <>
                          <button
                            onClick={() => handlePrintBill(table._id)}
                            className="btn-ghost py-2.5 px-3 text-xs md:text-sm font-semibold flex items-center justify-center gap-2"
                          >
                            <Printer size={16} />
                            Print Bill
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateTableStatus(table._id, "AVAILABLE")
                            }
                            className="btn-primary py-2.5 px-3 text-xs md:text-sm font-semibold"
                          >
                            Mark Complete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleUpdateTableStatus(table._id, "OCCUPIED")
                          }
                          className="btn-primary py-2.5 px-3 text-xs md:text-sm font-semibold"
                        >
                          Take Order
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 bg-${color}/10 rounded-lg flex items-center justify-center`}
      >
        <Icon size={20} className={`text-${color}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-text-light uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

/**
 * Detail Row Component
 */
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-text-light" />
        <span className="text-xs font-semibold text-text-light uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span className="text-sm font-bold text-text-primary">{value}</span>
    </div>
  );
}
