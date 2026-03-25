import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../../utils/notify";
import {
  ChevronLeft,
  Search,
  Clock,
  Loader2,
  UtensilsCrossed,
  ChevronRight,
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
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantId, setRestaurantId] = useState(
    parsedSession?.restaurantId ? String(parsedSession.restaurantId) : null,
  );
  const [tableName, setTableName] = useState("Table");
  const [requestingBill, setRequestingBill] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const customerSocket = useCustomerSocket({
    sessionId,
    restaurantId,
    tableId,
  });

  const deriveOrderStatusFromItems = (items = [], fallback = "NEW") => {
    const statuses = (Array.isArray(items) ? items : []).map((it) =>
      String(it?.itemStatus || "").toUpperCase(),
    );
    const totalItems = statuses.length;
    const servedCount = statuses.filter((s) => s === "SERVED").length;

    if (totalItems > 0 && servedCount === totalItems) return "SERVED";
    if (statuses.some((s) => s === "SERVING") || servedCount > 0)
      return "SERVING";
    if (statuses.some((s) => s === "READY")) return "READY";
    if (statuses.some((s) => s === "IN_PROGRESS")) return "IN_PROGRESS";

    return String(fallback || "NEW").toUpperCase();
  };

  const applyOrderLevelStatusToItems = (items = [], status) => {
    const normalizedStatus = String(status || "").toUpperCase();

    if (normalizedStatus === "READY") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: item.itemStatus === "SERVED" ? "SERVED" : "READY",
      }));
    }

    if (normalizedStatus === "SERVING") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: item.itemStatus === "SERVED" ? "SERVED" : "SERVING",
      }));
    }

    if (normalizedStatus === "SERVED") {
      return (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        itemStatus: "SERVED",
      }));
    }

    return Array.isArray(items) ? items : [];
  };

  // Listen for real-time item status updates
  useEffect(() => {
    if (!customerSocket) {
      console.warn("Customer socket unavailable; updates paused.");
      return;
    }
    console.log("CustomerOrders: setting up socket listeners", {
      sessionId,
      restaurantId,
      tableId,
    });
    const handleItemStatusUpdate = (data) => {
      console.log("Customer: item status update", data);
      const { orderId, _id, itemId, itemIndex, itemStatus, itemName } = data;
      const resolvedOrderId = orderId || _id;
      const incomingOrderStatus = String(
        data?.orderStatus || data?.status || "",
      ).toUpperCase();

      if (!resolvedOrderId) return;

      setOrders((prev) =>
        prev.map((order) => {
          if (String(order._id) !== String(resolvedOrderId)) return order;

          let nextItems = (order.items || []).map((item, idx) => {
            const matches =
              String(item._id) === String(itemId) || idx === itemIndex;
            if (!matches) return item;
            console.log(
              `Updating item ${itemName} from ${item.itemStatus} to ${itemStatus}`,
            );
            return { ...item, itemStatus };
          });

          // Some lifecycle events (order:served/order:status-changed) can be order-level only.
          if (
            !itemId &&
            (itemIndex === undefined || itemIndex === null) &&
            incomingOrderStatus
          ) {
            nextItems = applyOrderLevelStatusToItems(
              nextItems,
              incomingOrderStatus,
            );
          }

          return {
            ...order,
            items: nextItems,
            orderStatus: deriveOrderStatusFromItems(
              nextItems,
              incomingOrderStatus || order.orderStatus,
            ),
          };
        }),
      );
      // Show toasts for major transitions
      if (itemStatus === "READY") {
        notify.success(`${itemName || "Item"} is ready`, {
          duration: 4000,
        });
      }
      if (itemStatus === "SERVED") {
        notify.success(`${itemName || "Item"} has been served`, {
          duration: 3000,
        });
      }
    };
    // Primary event from emitter
    customerSocket.on("order:item-status-updated", handleItemStatusUpdate);
    // Fallback in case of different event name
    customerSocket.on("order:item-status", handleItemStatusUpdate);
    // Explicit READY event (sometimes emitted separately)
    customerSocket.on("order:item-ready", (data) => {
      console.log("Customer: item ready", data);
      // Apply the same state update
      handleItemStatusUpdate({ ...data, itemStatus: "READY" });
    });
    // Also listen for generic order updates in case payload comes from
    // order-level lifecycle events with sparse item information.
    customerSocket.on("order:updated", (data) => {
      console.log("Customer: order updated", data);
      handleItemStatusUpdate(data || {});
    });

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

  const canCustomerCancelOrder = (order) => {
    if (!order) return false;
    const status = normalizeStatus(order.orderStatus);
    if (isOrderCancelled(status) || isOrderCompleted(status)) return false;
    if (!["NEW", "OPEN", "PENDING_APPROVAL"].includes(status)) return false;

    const items = Array.isArray(order.items) ? order.items : [];
    const hasStarted = items.some((item) =>
      ["IN_PROGRESS", "READY", "SERVING", "SERVED"].includes(
        String(item?.itemStatus || "").toUpperCase(),
      ),
    );
    return !hasStarted;
  };

  const loadOrders = async ({ showLoading = false, silent = false } = {}) => {
    try {
      if (showLoading) setLoading(true);

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
        notify.error(err?.response?.data?.message || "Failed to load orders");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders({ showLoading: true });
  }, [sessionId, tableId]);

  // Real-time order lifecycle updates (new/confirmed/ready/served/cancelled)
  useEffect(() => {
    if (!customerSocket) return;

    const refreshFromSocket = (eventName) => {
      console.log(`CustomerOrders: ${eventName} received, syncing orders...`);
      loadOrders({ showLoading: false, silent: true });
    };

    const onOrderConfirmed = () => refreshFromSocket("order:confirmed");
    const onOrderPlaced = () => refreshFromSocket("order:placed");
    const onOrderReady = () => refreshFromSocket("order:ready");
    const onOrderReadyForServing = () =>
      refreshFromSocket("order:ready-for-serving");
    const onOrderServed = (data) => {
      if (!data?._id && !data?.orderId) {
        refreshFromSocket("order:served:sparse");
        return;
      }

      onOrderStatusChanged({
        ...data,
        orderStatus: "SERVED",
        status: "SERVED",
      });
    };
    const onOrderCancelled = () => refreshFromSocket("order:cancelled");
    const onConnect = () => refreshFromSocket("connect");
    const onReconnect = () => refreshFromSocket("reconnect");

    const onOrderStatusChanged = (data) => {
      const incomingId = data?._id || data?.orderId;
      const incomingStatus = String(
        data?.orderStatus || data?.status || "",
      ).toUpperCase();
      if (!incomingId || !incomingStatus) {
        refreshFromSocket("order:status-changed:sparse");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          String(order._id) === String(incomingId)
            ? {
                ...order,
                orderStatus: incomingStatus,
                items: applyOrderLevelStatusToItems(
                  order.items || [],
                  incomingStatus,
                ),
              }
            : order,
        ),
      );
    };

    const onOrderUpdated = (data) => {
      const incomingId = data?._id || data?.orderId;
      if (!incomingId) {
        refreshFromSocket("order:updated:sparse");
        return;
      }

      const incomingStatus = String(
        data?.orderStatus || data?.status || "",
      ).toUpperCase();

      setOrders((prev) =>
        prev.map((order) => {
          if (String(order._id) !== String(incomingId)) return order;

          const mergedItems = Array.isArray(data?.items)
            ? data.items
            : applyOrderLevelStatusToItems(order.items || [], incomingStatus);

          return {
            ...order,
            ...data,
            _id: order._id,
            items: mergedItems,
            orderStatus:
              incomingStatus ||
              deriveOrderStatusFromItems(mergedItems, order.orderStatus),
          };
        }),
      );
    };

    customerSocket.on("order:confirmed", onOrderConfirmed);
    customerSocket.on("order:placed", onOrderPlaced);
    customerSocket.on("order:status-changed", onOrderStatusChanged);
    customerSocket.on("order:ready", onOrderReady);
    customerSocket.on("order:ready-for-serving", onOrderReadyForServing);
    customerSocket.on("order:served", onOrderServed);
    customerSocket.on("order:cancelled", onOrderCancelled);
    customerSocket.on("order:updated", onOrderUpdated);
    customerSocket.on("connect", onConnect);
    customerSocket.on("reconnect", onReconnect);

    return () => {
      customerSocket.off("order:confirmed", onOrderConfirmed);
      customerSocket.off("order:placed", onOrderPlaced);
      customerSocket.off("order:status-changed", onOrderStatusChanged);
      customerSocket.off("order:ready", onOrderReady);
      customerSocket.off("order:ready-for-serving", onOrderReadyForServing);
      customerSocket.off("order:served", onOrderServed);
      customerSocket.off("order:cancelled", onOrderCancelled);
      customerSocket.off("order:updated", onOrderUpdated);
      customerSocket.off("connect", onConnect);
      customerSocket.off("reconnect", onReconnect);
    };
  }, [customerSocket, sessionId, tableId, restaurantId]);

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

  useEffect(() => {
    if (!filterOpen) return;
    const handleClick = (event) => {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [filterOpen]);

  const handleRequestBill = async () => {
    if (!restaurantId || !tableId) {
      notify.error("Table details missing. Please refresh and try again.");
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
        notify.error("Unable to connect. Please try again.");
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
        notify.success(`${tableName || "Your table"}: bill request sent`);
      } else {
        notify.error(ack?.error || "Failed to send bill request");
      }
    } catch (err) {
      console.error("Bill request failed:", err);
      notify.error("Failed to send bill request");
    } finally {
      setRequestingBill(false);
    }
  };

  const openCancelModal = (order) => {
    if (!order?._id) return;
    if (!canCustomerCancelOrder(order)) {
      notify.error("This order can no longer be cancelled.");
      return;
    }

    setCancelTarget(order);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    if (cancellingOrderId) return;
    setShowCancelModal(false);
    setCancelTarget(null);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget?._id) return;
    if (!canCustomerCancelOrder(cancelTarget)) {
      notify.error("This order can no longer be cancelled.");
      closeCancelModal();
      return;
    }

    setCancellingOrderId(cancelTarget._id);
    try {
      const deviceId = getDeviceId();
      await Axios({
        ...customerApi.order.cancel(cancelTarget._id),
        data: {
          reason: cancelReason?.trim() || "Cancelled by customer",
          tableId,
          deviceId,
        },
        headers: {
          "x-table-id": tableId,
          "x-device-id": deviceId,
        },
      });
      notify.success("Order cancelled successfully");
      await loadOrders({ showLoading: false, silent: true });
      closeCancelModal();
    } catch (err) {
      notify.error(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingOrderId(null);
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
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-100`;
      case "CANCELLED":
        return `${base} bg-red-50 text-red-700 border-red-100`;
      case "READY":
        return `${base} bg-blue-50 text-blue-700 border-blue-100`;
      case "SERVING":
        return `${base} bg-indigo-50 text-indigo-700 border-indigo-100`;
      case "IN_PROGRESS":
        return `${base} bg-amber-50 text-amber-700 border-amber-100`;
      default:
        return `${base} bg-orange-500 text-white border-orange-500`;
    }
  };

  const formatItemStatus = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();
    if (normalized === "NEW" || normalized === "PENDING") return "Pending";
    if (normalized === "IN_PROGRESS") return "Preparing";
    if (normalized === "READY") return "Ready";
    if (normalized === "SERVING") return "Serving";
    if (normalized === "SERVED") return "Served";
    return normalized.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white cmr-page">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-9 w-32 bg-slate-100 rounded-full animate-pulse cmr-shimmer" />
            <div className="h-7 w-20 bg-slate-100 rounded-full animate-pulse cmr-shimmer" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-10 bg-slate-100 rounded-2xl animate-pulse cmr-shimmer" />
            <div className="h-10 bg-slate-100 rounded-2xl animate-pulse cmr-shimmer" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`orders-shimmer-${idx}`}
                className="h-36 bg-slate-100 rounded-2xl animate-pulse cmr-shimmer"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-10 text-center font-sans cmr-page">
        <UtensilsCrossed
          size={48}
          className="text-slate-100 mb-6"
          strokeWidth={1}
        />
        <h1 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
          No orders yet
        </h1>
        <p className="text-sm text-slate-400 mb-8 font-medium">
          Your order history is currently empty.
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white font-sans pb-28 sm:pb-32 cmr-page"
    >
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 cmr-sticky-header">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
              >
                <ChevronLeft
                  size={18}
                  className="text-slate-900"
                  strokeWidth={2.5}
                />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  Orders <Sparkles size={14} className="text-orange-500" />
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live updates • {tableName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search order ID or item"
                className="w-full h-12 rounded-2xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 shadow-sm cmr-input"
              />
            </div>

            <div className="hidden sm:flex gap-2 overflow-x-auto no-scrollbar">
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
                  className={`h-11 px-3 rounded-2xl text-[11px] font-black whitespace-nowrap border transition-colors shadow-sm ${
                    activeTab === tab.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile dropdown filter */}
          <div className="sm:hidden mt-3" ref={filterRef}>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">
                Order Filter
              </p>
              <button
                onClick={() => setFilterOpen((prev) => !prev)}
                className="mt-2 w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 flex items-center justify-between shadow-sm"
                type="button"
              >
                <span className="capitalize">
                  {activeTab === "all" && "All orders"}
                  {activeTab === "active" && "Active orders"}
                  {activeTab === "completed" && "Completed orders"}
                  {activeTab === "cancelled" && "Cancelled orders"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${
                    filterOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {filterOpen && (
                <div className="mt-2 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  {[
                    {
                      key: "all",
                      label: "All orders",
                      count: orders.length,
                    },
                    {
                      key: "active",
                      label: "Active orders",
                      count: activeOrdersCount,
                    },
                    {
                      key: "completed",
                      label: "Completed orders",
                      count: completedOrdersCount,
                    },
                    {
                      key: "cancelled",
                      label: "Cancelled orders",
                      count: orders.filter((o) =>
                        isOrderCancelled(o.orderStatus),
                      ).length,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(opt.key);
                        setFilterOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm font-semibold flex items-center justify-between transition-colors ${
                        activeTab === opt.key
                          ? "bg-orange-50 text-orange-700"
                          : "bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-[11px] text-slate-400 font-bold">
                        {opt.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Showing: {filteredOrders.length}</span>
                <span>Tap to change</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-sm">
              {orders.length} orders
            </span>
            <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[11px] font-semibold text-orange-700 shadow-sm">
              {totalItemsCount} items
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-700 shadow-sm">
              {activeOrdersCount} active
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-sm">
              ₹{Math.round(grandTotal)} total
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {lastSyncedAt
                ? `Synced ${new Date(lastSyncedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Syncing..."}
            </span>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-6xl mx-auto"
        >
          {/* ORDER ACCORDION LIST */}
          <div className="space-y-4">
            {filteredOrders.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
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
                  <motion.div
                  key={`${order._id}-${order.items.map((it) => it.itemStatus).join(",")}`}
                    className="overflow-hidden cmr-card"
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {/* ACCORDION TRIGGER */}
                  <motion.button
                    onClick={() => toggleOrder(order._id)}
                    className={`w-full text-left flex items-center justify-between p-4 sm:p-5 bg-white border border-slate-200 transition-all shadow-sm ${
                      isExpanded
                        ? "rounded-t-3xl border-b-0"
                        : "rounded-3xl hover:shadow-md"
                    }`}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-slate-900 shrink-0 border border-orange-100">
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
                        <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-md text-slate-500 uppercase border border-slate-200">
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
                  </motion.button>

                  {/* ACCORDION CONTENT */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="bg-white border-x border-b border-slate-200 rounded-b-3xl overflow-hidden"
                      >
                        <div className="p-4 sm:p-5 pt-0 space-y-4">
                          <div className="h-px bg-slate-100 w-full mb-4" />

                          <OrderProgress
                            status={orderStatus}
                            items={order.items}
                          />

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Table: {tableName}</span>
                            <span>{order.items?.length || 0} items</span>
                          </div>

                          {/* CUSTOMER LABEL (INDIVIDUAL MODE ONLY) */}
                          {order.meta?.customerMode === "INDIVIDUAL" &&
                            order.meta?.customerLabel && (
                              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-[12px] font-bold text-blue-900 flex items-center gap-2">
                                Customer: {order.meta.customerLabel}
                              </div>
                            )}

                          {order.items?.map((it, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-start gap-3 group py-2 border-b border-slate-100 last:border-b-0"
                            >
                              <div className="flex-1">
                                <h4 className="font-bold text-[13px] text-slate-800 leading-none mb-2">
                                  {it.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                    x{it.quantity}
                                  </span>
                                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
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

                          {(order.orderStatus === "CANCELLED" ||
                            orderStatus === "CANCELLED") && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                              Cancelled by{" "}
                              {order.cancelledByRole ||
                                order.meta?.cancelledByRole ||
                                "Customer"}
                              {order.cancelReason || order.meta?.cancelReason
                                ? ` • ${order.cancelReason || order.meta?.cancelReason}`
                                : ""}
                            </div>
                          )}

                          {canCustomerCancelOrder(order) && (
                            <button
                              onClick={() => openCancelModal(order)}
                              disabled={cancellingOrderId === order._id}
                              className="w-full h-11 rounded-2xl border border-red-200 bg-red-50 text-red-700 font-black text-[11px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
                            >
                              {cancellingOrderId === order._id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                "Cancel Order"
                              )}
                            </button>
                          )}

                          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
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
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* FLOATING ACTION */}
      <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-4 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] cmr-safe-bottom">
        <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleRequestBill}
            disabled={requestingBill}
            className="h-14 rounded-3xl border border-emerald-200 bg-white text-emerald-700 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-[0.12em] shadow-md hover:shadow-lg hover:bg-emerald-50/70 active:scale-95 transition-all disabled:opacity-60"
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
            className="h-14 bg-gradient-to-r from-[#F35C2B] to-[#FF7A45] text-white rounded-3xl flex items-center justify-center gap-3 shadow-2xl shadow-orange-300 hover:shadow-orange-400 active:scale-95 transition-all"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.12em]">
              Add Items
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                    Cancel Order
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">
                    Are you sure?
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Cancel before prep starts.
                  </p>
                </div>
                <button
                  onClick={closeCancelModal}
                  className="h-8 w-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-600">
                  Add a reason (optional)
                </p>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tell us why you are cancelling"
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={closeCancelModal}
                  className="h-11 rounded-2xl border border-gray-200 bg-white text-gray-700 font-bold text-xs uppercase tracking-widest"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancellingOrderId === cancelTarget?._id}
                  className="h-11 rounded-2xl bg-red-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {cancellingOrderId === cancelTarget?._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Cancel Now"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrderProgress({ status, items = [] }) {
  const normalized = String(status || "PENDING").toUpperCase();

  const steps = [
    { key: "NEW", label: "Placed" },
    { key: "IN_PROGRESS", label: "Preparing" },
    { key: "READY", label: "Ready" },
    { key: "SERVING", label: "Serving" },
    { key: "SERVED", label: "Served" },
  ];

  const indexMap = {
    NEW: 0,
    PENDING: 0,
    IN_PROGRESS: 1,
    READY: 2,
    SERVING: 3,
    SERVED: 4,
    COMPLETED: 4,
    PAID: 4,
    DELIVERED: 4,
  };

  // Derive active step from both order-level status and item-level status.
  // We take the farthest progressed stage to avoid stale UI when one payload
  // arrives before the other.
  let activeIndex = indexMap[normalized] ?? 0;
  if (items && items.length > 0) {
    const itemStatuses = items.map((it) =>
      String(it.itemStatus || "NEW").toUpperCase(),
    );
    const totalItems = itemStatuses.length;
    const servedCount = itemStatuses.filter((s) => s === "SERVED").length;

    let itemIndex = 0;

    if (totalItems > 0 && servedCount === totalItems) itemIndex = 4;
    else if (itemStatuses.some((s) => s === "SERVING") || servedCount > 0)
      itemIndex = 3;
    else if (itemStatuses.some((s) => s === "READY")) itemIndex = 2;
    else if (itemStatuses.some((s) => s === "IN_PROGRESS")) itemIndex = 1;

    activeIndex = Math.max(activeIndex, itemIndex);
  }

  const isCancelled = normalized === "CANCELLED";

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
        This order was cancelled.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3">
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
