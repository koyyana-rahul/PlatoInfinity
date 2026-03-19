import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import { useCustomerSocket } from "../hooks/useCustomerSocket";
import { notify } from "../../../utils/notify";
import {
  ChevronLeft,
  Loader2,
  Clock,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Inbox,
} from "lucide-react";

/**
 * CustomerOrderStatus.jsx
 *
 * Shows live order status with real-time updates
 * Status progression: Pending → Sent to Kitchen → Ready → Served
 *
 * Color coding:
 * Pending (yellow)     - Order placed but not sent to kitchen
 * In Kitchen (orange)  - Order sent, being prepared
 * Ready (green)        - Item ready for pickup
 * Served (blue)        - Item served to customer
 */
export default function CustomerOrderStatus() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

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

  const sessionId =
    parsedSession?.sessionId ||
    parsedSession?._id ||
    parsedSession?.id ||
    rawSession ||
    null;
  const base = `/${useParams().brandSlug}/${useParams().restaurantSlug}/table/${tableId}`;

  // Join customer socket room for real-time updates
  const customerSocket = useCustomerSocket({
    sessionId,
    restaurantId,
    tableId,
  });

  // Fetch orders
  const fetchOrders = async () => {
    try {
      if (!sessionId) return;

      const res = await Axios(customerApi.order.listBySession(sessionId));
      const ordersData = res.data?.data || [];
      setOrders(ordersData);

      // Extract restaurantId from first order if available
      if (
        ordersData.length > 0 &&
        ordersData[0].restaurantId &&
        !restaurantId
      ) {
        setRestaurantId(ordersData[0].restaurantId);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch table data to get restaurantId
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const res = await Axios({
          url: `/api/table/${tableId}`,
          method: "GET",
        });
        if (res.data?.data?.restaurantId) {
          setRestaurantId(res.data.data.restaurantId);
        }
      } catch (err) {
        console.error("Failed to fetch table data:", err);
      }
    };

    if (tableId) {
      fetchTableData();
    }
  }, [tableId]);

  useEffect(() => {
    if (!sessionId) {
      navigate(base, { replace: true });
      return;
    }

    fetchOrders();

    // 🔥 REAL-TIME SOCKET LISTENERS
    const applyLiveItemStatus = (data) => {
      console.log("Customer received status update:", data);
      const resolvedOrderId = data?.orderId || data?._id;
      if (!resolvedOrderId) return;

      const normalizedIncomingStatus = String(
        data?.orderStatus || data?.status || "",
      ).toUpperCase();

      if (data.itemStatus === "READY") {
        notify.success(`${data.itemName || "Item"} is ready`, {
          duration: 5000,
        });
      }

      if (data.itemStatus === "IN_PROGRESS") {
        notify.info(`${data.itemName || "Your item"} is being prepared`, {
          duration: 3000,
        });
      }

      if (data.itemStatus === "SERVED") {
        notify.success(`${data.itemName || "Item"} has been served`, {
          duration: 4000,
        });
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          String(order._id) === String(resolvedOrderId)
            ? {
                ...order,
                orderStatus: normalizedIncomingStatus || order.orderStatus,
                items: (order.items || []).map((item, idx) => {
                  const byId =
                    data.itemId && String(item._id) === String(data.itemId);
                  const byIndex =
                    data.itemIndex !== undefined &&
                    data.itemIndex !== null &&
                    idx === data.itemIndex;
                  // If event is order-level (e.g. order:served), item references can be absent.
                  const applyOrderLevelServed =
                    !data.itemId &&
                    (data.itemIndex === undefined || data.itemIndex === null) &&
                    normalizedIncomingStatus === "SERVED";

                  if (!byId && !byIndex && !applyOrderLevelServed) return item;

                  return {
                    ...item,
                    itemStatus:
                      data.itemStatus ||
                      (applyOrderLevelServed ? "SERVED" : item.itemStatus),
                    updatedAt: data.updatedAt || item.updatedAt,
                  };
                }),
              }
            : order,
        ),
      );
    };

    if (customerSocket) {
      customerSocket.on("order:item-ready", applyLiveItemStatus);
      customerSocket.on("order:item-status-updated", applyLiveItemStatus);
      customerSocket.on("order:item-status", applyLiveItemStatus);
      customerSocket.on("order:status-changed", applyLiveItemStatus);
      customerSocket.on("order:ready", applyLiveItemStatus);
      customerSocket.on("order:served", applyLiveItemStatus);
      customerSocket.on("order:cancelled", applyLiveItemStatus);
    }

    // Fallback polling
    const interval = setInterval(fetchOrders, 30000);

    return () => {
      clearInterval(interval);
      if (customerSocket) {
        customerSocket.off("order:item-ready", applyLiveItemStatus);
        customerSocket.off("order:item-status-updated", applyLiveItemStatus);
        customerSocket.off("order:item-status", applyLiveItemStatus);
        customerSocket.off("order:status-changed", applyLiveItemStatus);
        customerSocket.off("order:ready", applyLiveItemStatus);
        customerSocket.off("order:served", applyLiveItemStatus);
        customerSocket.off("order:cancelled", applyLiveItemStatus);
      }
    };
  }, [sessionId, customerSocket]);

  const getItemStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return {
          label: "Pending",
          color: "bg-yellow-50 border-yellow-200",
          textColor: "text-yellow-900",
          dotColor: "bg-yellow-500",
        };
      case "IN_PROGRESS":
        return {
          label: "Preparing",
          color: "bg-orange-50 border-orange-200",
          textColor: "text-orange-900",
          dotColor: "bg-orange-500",
        };
      case "READY":
        return {
          label: "Ready",
          color: "bg-emerald-50 border-emerald-200",
          textColor: "text-emerald-900",
          dotColor: "bg-emerald-500",
        };
      case "SERVED":
        return {
          label: "Served",
          color: "bg-blue-50 border-blue-200",
          textColor: "text-blue-900",
          dotColor: "bg-blue-500",
        };
      default:
        return {
          label: status,
          color: "bg-slate-50 border-slate-200",
          textColor: "text-slate-900",
          dotColor: "bg-slate-400",
        };
    }
  };

  const getAllItemsServed = (items) => {
    return items?.every((i) => i.itemStatus === "SERVED");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="text-blue-600 animate-spin mx-auto mb-4"
          />
          <p className="text-slate-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Inbox size={32} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          No Orders Yet
        </h2>
        <p className="text-slate-500 text-center mb-8 max-w-sm">
          Add items to your cart and place an order to see status updates here.
        </p>
        <button
          onClick={() => navigate(base + "/menu")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
        >
          View Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* HEADER */}
      <div className="bg-white/90 border-b border-slate-200 sticky top-0 z-20 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Order Status
            </h1>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* ORDERS */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-12">
        {orders.map((order) => {
          const allServed = getAllItemsServed(order.items);

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200 shadow-[0_18px_40px_-34px_rgba(2,6,23,0.45)] overflow-hidden"
            >
              {/* ORDER HEADER */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-slate-900">
                    Order #{order._id?.toString().slice(-6).toUpperCase()}
                  </h2>
                  {allServed && (
                    <div className="flex items-center gap-2 bg-green-100 text-green-900 px-3 py-1 rounded-full text-sm font-bold">
                      <CheckCircle2 size={16} />
                      All Served
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  Placed {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* ITEMS LIST */}
              <div className="divide-y divide-slate-100">
                {order.items?.map((item, idx) => {
                  const status = getItemStatusBadge(item.itemStatus);

                  return (
                    <div key={idx} className="px-6 py-4">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-lg">
                            {item.quantity}x {item.name}
                          </p>
                          {item.selectedModifiers?.length > 0 && (
                            <p className="text-sm text-slate-500 mt-1">
                              {item.selectedModifiers
                                .map((m) => m.title)
                                .join(", ")}
                            </p>
                          )}
                          {item.meta?.notes && (
                            <p className="text-sm text-slate-600 mt-2 italic bg-slate-50 p-2 rounded">
                              {item.meta.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* STATUS BADGE */}
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${status.color}`}
                      >
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${status.dotColor}`}
                        />
                        <span
                          className={`font-bold text-sm ${status.textColor}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {/* TIMELINE */}
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        {item.claimedAt && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              Started at{" "}
                              {new Date(item.claimedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {item.readyAt && (
                          <div className="flex items-center gap-1 ml-4">
                            <CheckCircle2 size={14} />
                            <span>
                              Ready at{" "}
                              {new Date(item.readyAt).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                        {item.servedAt && (
                          <div className="flex items-center gap-1 ml-4">
                            <MapPin size={14} />
                            <span>
                              Served at{" "}
                              {new Date(item.servedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ORDER FOOTER */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">
                  {order.items?.length} items
                </span>
                <span className="text-sm font-bold text-slate-600">
                  {allServed ? "All items delivered" : "In progress"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIVE UPDATE INDICATOR */}
      <div className="fixed bottom-5 right-4 sm:right-6 flex items-center gap-2 bg-white/95 border border-slate-200 rounded-full px-4 py-2.5 shadow-lg">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs sm:text-sm font-semibold text-slate-700">
          Live Updates
        </span>
      </div>
    </div>
  );
}
