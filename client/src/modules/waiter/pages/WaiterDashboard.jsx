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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-3 sm:px-6 py-3 sm:py-5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                <Utensils size={18} className="text-brand-primary" />
              </div>
              <div>
                <h1 className="text-[12px] sm:text-lg font-black text-slate-900">
                  Waiter Dashboard
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-0">
                  Open sessions, hand over PIN, and track occupied tables.
                </p>
              </div>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live updates
            </div>
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
          <div className="mt-5 sm:mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            {["all", "AVAILABLE", "OCCUPIED", "WAITING", "SETTLING"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap border transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-text-secondary border-slate-200 hover:bg-slate-50"
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
      <main className="px-4 sm:px-6 py-5 sm:py-6 max-w-7xl mx-auto">
        {filteredTables.length === 0 ? (
          <div className="flex items-center justify-center min-h-[420px]">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 ring-1 ring-slate-200">
                <ChefHat size={40} className="text-text-light" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                No tables
              </h2>
              <p className="text-slate-500 text-sm sm:text-base max-w-sm">
                {filterStatus === "all"
                  ? "No tables found"
                  : `No tables with status: ${filterStatus}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* TABLE HEADER */}
                    <div
                      className={`${config.bg} px-4 py-3 rounded-2xl mb-4 flex items-center justify-between border border-slate-200`}
                    >
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                          Table
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                          {table.tableNumber}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${config.dot}`}
                        />
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
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
                      <div className="bg-brand-cta/10 border border-brand-cta/30 rounded-2xl p-3 mb-4">
                        <p className="text-[11px] font-semibold text-brand-cta mb-1">
                          Notes
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
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
                          className="btn-primary h-11 rounded-2xl px-3 text-xs sm:text-sm font-semibold"
                        >
                          Assign Table
                        </button>
                      ) : table.status === "OCCUPIED" ? (
                        <>
                          <button
                            onClick={() => setSelectedTable(table)}
                            className="btn-ghost h-11 rounded-2xl px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                          >
                            <Eye size={16} />
                            View Orders
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateTableStatus(table._id, "SETTLING")
                            }
                            className="btn-secondary h-11 rounded-2xl px-3 text-xs sm:text-sm font-semibold"
                          >
                            Call Bill
                          </button>
                        </>
                      ) : table.status === "SETTLING" ? (
                        <>
                          <button
                            onClick={() => handlePrintBill(table._id)}
                            className="btn-ghost h-11 rounded-2xl px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                          >
                            <Printer size={16} />
                            Print Bill
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateTableStatus(table._id, "AVAILABLE")
                            }
                            className="btn-primary h-11 rounded-2xl px-3 text-xs sm:text-sm font-semibold"
                          >
                            Mark Complete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleUpdateTableStatus(table._id, "OCCUPIED")
                          }
                          className="btn-primary h-11 rounded-2xl px-3 text-xs sm:text-sm font-semibold"
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
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
      <div
        className={`w-10 h-10 bg-${color}/10 rounded-2xl flex items-center justify-center`}
      >
        <Icon size={20} className={`text-${color}`} />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-black text-slate-900">{value}</p>
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
        <Icon size={14} className="text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}
