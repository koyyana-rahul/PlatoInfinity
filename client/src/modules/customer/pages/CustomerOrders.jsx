import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Search,
  Clock,
  Loader2,
  UtensilsCrossed,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  ReceiptText,
  Sparkles,
  ChevronDown,
  Circle,
} from "lucide-react";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import {
  useCustomerSocket,
  ensureCustomerSocketConnection,
  emitCustomerSocketEvent,
} from "../hooks/useCustomerSocket";

export default function CustomerOrders() {
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const navigate = useNavigate();

  const sessionKey = `plato:customerSession:${tableId}`;
  const rawSession = localStorage.getItem(sessionKey);
  const parsedSession = (() => {
    if (!rawSession) return null;
    try {
      return JSON.parse(rawSession);
    } catch {
      return null;
    }
  })();

  const sessionId = (() => {
    if (!rawSession) return null;
    return (
      parsedSession?.sessionId ||
      parsedSession?._id ||
      parsedSession?.id ||
      rawSession ||
      null
    );
  })();

  const sessionToken =
    parsedSession?.sessionToken ||
    parsedSession?.token ||
    localStorage.getItem("x-session-token") ||
    sessionId;

  const basePath = `/${brandSlug}/${restaurantSlug}/table/${tableId}`;

  const getDeviceId = () => {
    let deviceId = localStorage.getItem("plato:deviceId");
    if (!deviceId) {
      deviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("plato:deviceId", deviceId);
    }
    return deviceId;
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantId, setRestaurantId] = useState(null);
  const [tableName, setTableName] = useState("Table");
  const [requestingBill, setRequestingBill] = useState(false);

  const customerSocket = useCustomerSocket({
    sessionId,
    restaurantId,
    tableId,
  });

  // Listen for real-time item status updates
  useEffect(() => {
    if (!customerSocket) {
      console.warn("⚠️ customerSocket is null, cannot listen for updates");
      return;
    }
    console.log("🔧 CustomerOrders: setting up socket listeners", { sessionId, restaurantId, tableId });
    const handleItemStatusUpdate = (data) => {
      console.log("📶 Customer: item status update", data);
      const { orderId, itemId, itemIndex, itemStatus, itemName } = data;
      setOrders((prev) =>
        prev.map((order) => {
          if (String(order._id) !== String(orderId)) return order;
          return {
            ...order,
            items: order.items.map((item, idx) => {
              const matches =
                String(item._id) === String(itemId) || idx === itemIndex;
              if (!matches) return item;
              console.log(`🔄 Updating item ${itemName} from ${item.itemStatus} to ${itemStatus}`);
              return { ...item, itemStatus };
            }),
          };
        }),
      );
      // Show toasts for major transitions
      if (itemStatus === "READY") {
        toast(`${itemName || "Item"} is ready!`, { icon: "✅", duration: 4000 });
      }
      if (itemStatus === "SERVED") {
        toast(`${itemName || "Item"} has been served!`, { icon: "🍽️", duration: 3000 });
      }
    };
    // Primary event from emitter
    customerSocket.on("order:item-status-updated", handleItemStatusUpdate);
    // Fallback in case of different event name
    customerSocket.on("order:item-status", handleItemStatusUpdate);
    // Explicit READY event (sometimes emitted separately)
    customerSocket.on("order:item-ready", (data) => {
      console.log("🔔 Customer: item ready", data);
      // Apply the same state update
      handleItemStatusUpdate({ ...data, itemStatus: "READY" });
    });
    // Also listen for generic order updates in case
    customerSocket.on("order:updated", (data) => {
      console.log("📶 Customer: order updated", data);
      if (data.items) {
        handleItemStatusUpdate(data);
      }
    });

    // When any event arrives, ensure we are in the right room (defensive)
    const ensureRoom = () => {
      if (sessionId && restaurantId && tableId) {
        console.log("🔁 Ensuring customer room membership...");
        customerSocket.emit("join:customer", { sessionId, tableId, restaurantId });
      }
    };
    customerSocket.on("order:item-status-updated", ensureRoom);
    customerSocket.on("order:item-status", ensureRoom);
    customerSocket.on("order:item-ready", ensureRoom);

    return () => {
      customerSocket.off("order:item-status-updated", handleItemStatusUpdate);
      customerSocket.off("order:item-status", handleItemStatusUpdate);
      customerSocket.off("order:item-ready");
      customerSocket.off("order:updated");
    };
  }, [customerSocket, sessionId, restaurantId, tableId]);

  const normalizeStatus = (status) => String(status || "PENDING").toUpperCase();

  const isOrderCompleted = (status) => {
    const s = normalizeStatus(status);
    return ["SERVED", "COMPLETED", "PAID", "DELIVERED"].includes(s);
  };

  const isOrderCancelled = (status) => normalizeStatus(status) === "CANCELLED";

  const loadOrders = async ({ showLoading = false, silent = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      if (!showLoading) setRefreshing(true);

      const deviceId = getDeviceId();
      const res = sessionId
        ? await Axios(customerApi.order.listBySession(sessionId))
        : await Axios({
            ...customerApi.order.listByTable(tableId),
            headers: {
              "x-table-id": tableId,
              "x-device-id": deviceId,
            },
          });
      const orderData = res.data?.data || res.data || [];
      const finalOrders = Array.isArray(orderData) ? orderData : [];
      setOrders(finalOrders);
      setLastSyncedAt(new Date().toISOString());

      // Auto-expand the most recent order if it exists
      if (finalOrders.length > 0) {
        setExpandedOrders((prev) => ({
          ...prev,
          [finalOrders[0]._id]: true,
        }));
      }
    } catch (err) {
      if (!silent) {
        toast.error(err?.response?.data?.message || "Failed to load orders");
      }
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders({ showLoading: true });

    const interval = setInterval(() => {
      loadOrders({ showLoading: false, silent: true });
    }, 15000);

    return () => clearInterval(interval);
  }, [sessionId, tableId]);

  useEffect(() => {
    let active = true;

    const loadTableInfo = async () => {
      try {
        const res = await Axios(customerApi.publicTable(tableId));
        if (!active) return;

        const data = res.data?.data;
        if (data?.restaurantId) setRestaurantId(String(data.restaurantId));
        if (data?.tableNumber) setTableName(String(data.tableNumber));
      } catch (err) {
        console.warn("Could not load table info for bill request:", err);
      }
    };

    if (tableId) loadTableInfo();

    return () => {
      active = false;
    };
  }, [tableId]);

  const handleRequestBill = async () => {
    if (!restaurantId || !tableId) {
      toast.error("Table details missing. Please refresh and try again.");
      return;
    }

    setRequestingBill(true);

    try {
      // ✅ Use socket emit (primary method - no authentication required)
      // Socket is already connected via useCustomerSocket hook
      const connected = await ensureCustomerSocketConnection({
        sessionId,
        restaurantId,
        tableId,
      });

      if (!connected) {
        toast.error("Unable to connect. Please try again.");
        setRequestingBill(false);
        return;
      }

      // Emit bill request to waiter room via socket
      const ack = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ ok: false, error: "Request timeout" });
        }, 5000);

        emitCustomerSocketEvent(
          "table:call_waiter",
          {
            restaurantId: String(restaurantId),
            tableId: String(tableId),
            tableName: tableName || "Table",
            reason: "BILL_REQUEST",
          },
          (response) => {
            clearTimeout(timeout);
            resolve(response || { ok: true });
          },
        );
      });

      if (ack?.ok) {
        toast.success(`${tableName || "Your table"}: Bill request sent ✅`);
      } else {
        toast.error(ack?.error || "Failed to send bill request");
      }
    } catch (err) {
      console.error("Bill request failed:", err);
      toast.error("Failed to send bill request");
    } finally {
      setRequestingBill(false);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const grandTotal = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );

  const totalItemsCount = orders.reduce(
    (sum, order) => sum + (order.items?.length || 0),
    0,
  );

  const activeOrdersCount = orders.filter(
    (order) =>
      !isOrderCompleted(order.orderStatus) &&
      !isOrderCancelled(order.orderStatus),
  ).length;

  const completedOrdersCount = orders.filter((order) =>
    isOrderCompleted(order.orderStatus),
  ).length;

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeStatus(order.orderStatus);

      const tabPass =
        activeTab === "all"
          ? true
          : activeTab === "active"
            ? !isOrderCompleted(status) && !isOrderCancelled(status)
            : activeTab === "completed"
              ? isOrderCompleted(status)
              : activeTab === "cancelled"
                ? isOrderCancelled(status)
                : true;

      if (!tabPass) return false;
      if (!q) return true;

      const orderLabel = String(
        order.orderNumber || order._id || "",
      ).toLowerCase();
      const hasItem = (order.items || []).some((it) =>
        String(it?.name || "")
          .toLowerCase()
          .includes(q),
      );

      return orderLabel.includes(q) || hasItem;
    });
  }, [orders, activeTab, searchQuery]);

  const getStatusStyles = (status) => {
    const base =
      "text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border";
    switch (normalizeStatus(status)) {
      case "COMPLETED":
      case "PAID":
      case "SERVED":
      case "DELIVERED":
        return `${base} bg-emerald-50 text-emerald-600 border-emerald-100`;
      case "CANCELLED":
        return `${base} bg-red-50 text-red-600 border-red-100`;
      case "READY":
        return `${base} bg-blue-50 text-blue-700 border-blue-100`;
      case "IN_PROGRESS":
        return `${base} bg-amber-50 text-amber-700 border-amber-100`;
      default:
        return `${base} bg-slate-900 text-white border-slate-900`;
    }
  };

  const formatItemStatus = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();
    if (normalized === "NEW" || normalized === "PENDING") return "Pending";
    if (normalized === "IN_PROGRESS") return "Sent";
    if (normalized === "READY") return "Ready";
    if (normalized === "SERVED") return "Served";
    return normalized.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <Loader2
          className="w-6 h-6 text-slate-900 animate-spin mb-4"
          strokeWidth={1.5}
        />
        <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
          Syncing Orders
        </p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 text-center font-sans">
        <UtensilsCrossed
          size={48}
          className="text-slate-100 mb-6"
          strokeWidth={1}
        />
        <h1 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          No history
        </h1>
        <p className="text-sm text-slate-400 mb-8 font-medium">
          Your order list is currently empty.
        </p>
        <button
          onClick={() => navigate(basePath + "/menu")}
          className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-200"
        >
          Start Ordering <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white font-sans pb-28 sm:pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100"
              >
                <ChevronLeft
                  size={18}
                  className="text-gray-900"
                  strokeWidth={2.5}
                />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Your Orders <Sparkles size={14} className="text-orange-500" />
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live updates every 15s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadOrders({ showLoading: false })}
                className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50"
                disabled={refreshing}
              >
                <RefreshCw
                  size={13}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Running Tab
              </p>
              <p className="text-lg font-bold text-gray-900">
                ₹{Math.round(grandTotal)}
              </p>
            </div>

            <p className="text-[10px] text-gray-500 font-semibold">
              {lastSyncedAt
                ? `Synced ${new Date(lastSyncedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Syncing..."}
            </p>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-3 gap-2">
            <Kpi label="Total" value={orders.length} />
            <Kpi label="Total Items" value={totalItemsCount} tone="orange" />
            <Kpi label="Active" value={activeOrdersCount} tone="green" />
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID or item name"
                className="w-full h-10 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { key: "all", label: `All (${orders.length})` },
                { key: "active", label: `Active (${activeOrdersCount})` },
                {
                  key: "completed",
                  label: `Completed (${completedOrdersCount})`,
                },
                {
                  key: "cancelled",
                  label: `Cancelled (${orders.filter((o) => isOrderCancelled(o.orderStatus)).length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-10 px-3 rounded-xl text-xs font-bold whitespace-nowrap border transition-colors ${
                    activeTab === tab.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="max-w-5xl mx-auto">
          {/* SUMMARY CARD */}
          <div className="mb-8 bg-slate-900 rounded-3xl p-5 sm:p-6 text-white flex items-center justify-between shadow-2xl shadow-slate-200">
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "Order" : "Orders"}
              </h2>
              <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest mt-1">
                {totalItemsCount} Items Total
              </p>
            </div>
            <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
          </div>

          {/* ORDER ACCORDION LIST */}
          <div className="space-y-4">
            {filteredOrders.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <p className="text-sm font-bold text-gray-700">
                  No matching orders
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Try changing filter or search text.
                </p>
              </div>
            )}

            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders[order._id];
              const orderStatus = normalizeStatus(order.orderStatus);

              return (
                <div key={`${order._id}-${order.items.map(it => it.itemStatus).join(",")}`} className="overflow-hidden">
                  {/* ACCORDION TRIGGER */}
                  <button
                    onClick={() => toggleOrder(order._id)}
                    className={`w-full text-left flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-100 transition-all ${
                      isExpanded
                        ? "rounded-t-3xl border-b-0"
                        : "rounded-3xl shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 shrink-0">
                        <ReceiptText size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          {order.orderNumber ||
                            `ID: ${(order._id || "").slice(-5).toUpperCase()}`}
                        </p>
                        <p className="text-[14px] font-black text-slate-900 mt-0.5">
                          ₹{Math.round(order.totalAmount)}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                          <Circle
                            size={8}
                            className="text-orange-500 fill-current"
                          />
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "short",
                              })
                            : "--"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={getStatusStyles(orderStatus)}>
                        {orderStatus.replace(/_/g, " ")}
                      </span>

                      {!isExpanded && (
                        <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-500 uppercase">
                          {order.items?.length} Items
                        </span>
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                      >
                        <ChevronDown size={18} className="text-slate-400" />
                      </motion.div>
                    </div>
                  </button>

                  {/* ACCORDION CONTENT */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="bg-white border-x border-b border-slate-100 rounded-b-3xl overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 pt-0 space-y-4">
                          <div className="h-px bg-slate-50 w-full mb-4" />

                          <OrderProgress status={orderStatus} items={order.items} />

                          {/* CUSTOMER LABEL (INDIVIDUAL MODE ONLY) */}
                          {order.meta?.customerMode === "INDIVIDUAL" &&
                            order.meta?.customerLabel && (
                              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-[12px] font-bold text-blue-900 flex items-center gap-2">
                                👤 {order.meta.customerLabel}
                              </div>
                            )}

                          {order.items?.map((it, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-start gap-3 group"
                            >
                              <div className="flex-1">
                                <h4 className="font-bold text-[13px] text-slate-800 uppercase leading-none mb-2">
                                  {it.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                    x{it.quantity}
                                  </span>
                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                    <Clock size={10} />
                                    {formatItemStatus(it.itemStatus)}
                                  </span>
                                </div>
                              </div>
                              <p className="font-bold text-[13px] text-slate-900">
                                ₹{Math.round(it.price * it.quantity)}
                              </p>
                            </div>
                          ))}

                          <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Clock size={12} />
                              <span className="text-[9px] font-bold uppercase tracking-widest">
                                {order.createdAt
                                  ? new Date(
                                      order.createdAt,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "--:--"}
                              </span>
                            </div>
                            <span className={getStatusStyles(orderStatus)}>
                              {orderStatus || "PENDING"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* FLOATING ACTION */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-4 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleRequestBill}
            disabled={requestingBill}
            className="h-14 rounded-3xl border border-emerald-300 bg-emerald-50 text-emerald-700 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-[0.12em] shadow-lg shadow-emerald-100 active:scale-95 transition-transform disabled:opacity-60"
          >
            {requestingBill ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ReceiptText size={16} />
            )}
            <span>Request Bill</span>
          </button>

          <button
            onClick={() => navigate(basePath + "/menu")}
            className="h-14 bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] text-white rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-orange-300 active:scale-95 transition-transform"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.12em]">
              Add Items
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "orange"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : tone === "green"
        ? "bg-green-50 border-green-200 text-green-700"
        : "bg-white border-gray-200 text-gray-700";

  return (
    <div className={`rounded-lg border p-2.5 text-center ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="text-base font-bold mt-0.5">{value}</p>
    </div>
  );
}

function OrderProgress({ status, items = [] }) {
  const normalized = String(status || "PENDING").toUpperCase();

  const steps = [
    { key: "NEW", label: "Placed" },
    { key: "IN_PROGRESS", label: "Preparing" },
    { key: "READY", label: "Ready" },
    { key: "SERVED", label: "Served" },
  ];

  const indexMap = {
    NEW: 0,
    PENDING: 0,
    IN_PROGRESS: 1,
    READY: 2,
    SERVED: 3,
    COMPLETED: 3,
    PAID: 3,
    DELIVERED: 3,
  };

  // Derive active step from highest item status if items exist
  let activeIndex = indexMap[normalized] ?? 0;
  if (items && items.length > 0) {
    const itemStatuses = items.map((it) => String(it.itemStatus || "NEW").toUpperCase());
    if (itemStatuses.some((s) => s === "SERVED")) activeIndex = 3;
    else if (itemStatuses.some((s) => s === "READY")) activeIndex = 2;
    else if (itemStatuses.some((s) => s === "IN_PROGRESS")) activeIndex = 1;
    else activeIndex = 0;
  }

  const isCancelled = normalized === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
        This order was cancelled.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
      <div className="flex items-center justify-between gap-1">
        {steps.map((step, idx) => {
          const done = idx <= activeIndex;
          return (
            <div key={step.key} className="flex-1 flex items-center gap-1.5">
              <div
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  done ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              <span
                className={`text-[10px] font-bold transition-colors ${
                  done ? "text-emerald-700" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div
                  className={`h-[2px] flex-1 rounded transition-colors ${
                    idx < activeIndex ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
