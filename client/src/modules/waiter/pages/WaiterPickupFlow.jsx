import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock, CheckCircle, Truck, AlertCircle, Loader2 } from "lucide-react";
import Axios from "../../../api/axios";
import WaiterPinConfirmationModal from "../components/WaiterPinConfirmationModal";
import { useSocket } from "../../../socket/SocketProvider";

/**
 * WaiterPickupFlow.jsx
 *
 * Waiter sees ready items, picks them up, and marks as served
 * Workflow:
 * 1. Chef marks READY
 * 2. Waiter gets notification
 * 3. Waiter sees "Ready to Pickup" list
 * 4. Taps "Pickup & Serve"
 * 5. Modal confirms with PIN
 * 6. Item marked as SERVED
 */
export default function WaiterPickupFlow() {
  const { restaurantId } = useParams();
  const socket = useSocket();
  const [readyItems, setReadyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickingUp, setPickingUp] = useState(false);

  // PIN MODAL
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isPinLoading, setIsPinLoading] = useState(false);

  // Fetch ready items
  const fetchReadyItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await Axios({
        url: `/api/waiter/ready-items`,
        method: "GET",
      });

      setReadyItems(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ready items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReadyItems();
  }, [fetchReadyItems]);

  // Real-time waiter updates
  useEffect(() => {
    if (!socket) return;

    const handleReadyAlert = (payload) => {
      toast.success(payload?.message || "New item ready for pickup", {
        icon: "🔔",
      });
      fetchReadyItems();
    };

    const handleItemStatusUpdate = (payload) => {
      if (!payload?.itemStatus) return;
      if (
        ["READY", "SERVING", "SERVED", "CANCELLED"].includes(
          String(payload.itemStatus).toUpperCase(),
        )
      ) {
        fetchReadyItems();
      }
    };

    const handleOrderLifecycle = () => {
      fetchReadyItems();
    };

    const handleConnect = () => {
      fetchReadyItems();
    };

    socket.on("waiter:item-ready-alert", handleReadyAlert);
    socket.on("table:item-status-changed", handleItemStatusUpdate);
    socket.on("order:item-status-updated", handleItemStatusUpdate);
    socket.on("order:status-changed", handleOrderLifecycle);
    socket.on("order:ready", handleOrderLifecycle);
    socket.on("order:served", handleOrderLifecycle);
    socket.on("order:cancelled", handleOrderLifecycle);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("waiter:item-ready-alert", handleReadyAlert);
      socket.off("table:item-status-changed", handleItemStatusUpdate);
      socket.off("order:item-status-updated", handleItemStatusUpdate);
      socket.off("order:status-changed", handleOrderLifecycle);
      socket.off("order:ready", handleOrderLifecycle);
      socket.off("order:served", handleOrderLifecycle);
      socket.off("order:cancelled", handleOrderLifecycle);
      socket.off("connect", handleConnect);
    };
  }, [socket, fetchReadyItems]);

  const handlePickupClick = (orderId, itemId, itemName, tableName) => {
    setPendingAction({
      orderId,
      itemId,
      itemName,
      tableName,
    });
    setShowPinModal(true);
  };

  const handlePinConfirm = async (pin) => {
    if (!pendingAction) return;

    try {
      setIsPinLoading(true);
      const { orderId, itemId } = pendingAction;

      const res = await Axios({
        url: `/api/waiter/order/${orderId}/item/${itemId}/serve`,
        method: "POST",
        data: { staffPin: pin },
      });

      if (res.data?.success) {
        toast.success("✅ Item served!");
        setShowPinModal(false);
        setPendingAction(null);
        fetchReadyItems();
      } else {
        toast.error(res.data?.message || "Failed to mark as served");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Error marking as served";
      toast.error(msg);
    } finally {
      setIsPinLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="text-orange-500 animate-spin mx-auto mb-4"
          />
          <p className="text-slate-300">Loading ready items...</p>
        </div>
      </div>
    );
  }

  if (readyItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck size={32} className="text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Items Ready</h2>
          <p className="text-slate-400 mb-8">
            Items from the kitchen will appear here when ready for pickup
          </p>
          <button
            onClick={fetchReadyItems}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* HEADER */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Ready for Pickup</h1>
            <p className="text-sm text-slate-400 mt-1">
              {readyItems.length} item{readyItems.length !== 1 ? "s" : ""} ready
            </p>
          </div>
          <button
            onClick={fetchReadyItems}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300"
          >
            🔄
          </button>
        </div>
      </div>

      {/* READY ITEMS LIST */}
      <div className="p-4 space-y-4 pb-8">
        {readyItems.map((order) => (
          <div
            key={order._id}
            className="bg-slate-800 border-2 border-emerald-600 rounded-xl overflow-hidden"
          >
            {/* ORDER HEADER */}
            <div className="bg-emerald-900/30 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Table</p>
                <p className="text-2xl font-bold text-white">
                  {order.tableName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={24} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-400">
                  READY
                </span>
              </div>
            </div>

            {/* ITEMS */}
            <div className="divide-y divide-slate-700 p-4 space-y-4">
              {order.items?.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-slate-700/50 rounded-lg p-4 flex items-start justify-between gap-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0 border-slate-600 -mx-4 px-4 -my-2 py-2 last:-my-2 last:py-2"
                >
                  <div className="flex-1">
                    <p className="font-bold text-white text-lg">
                      {item.quantity}x {item.name}
                    </p>
                    {item.selectedModifiers?.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        {item.selectedModifiers.map((m) => m.title).join(", ")}
                      </p>
                    )}
                    {item.meta?.notes && (
                      <p className="text-xs text-yellow-400 mt-2 bg-yellow-900/30 px-2 py-1 rounded inline-block">
                        📝 {item.meta.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      handlePickupClick(
                        order._id,
                        item._id,
                        item.name,
                        order.tableName,
                      )
                    }
                    disabled={isPinLoading}
                    className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-bold rounded-lg transition-all active:scale-95 text-sm whitespace-nowrap disabled:cursor-not-allowed"
                  >
                    {isPinLoading ? "Serving..." : "Serve ✓"}
                  </button>
                </div>
              ))}
            </div>

            {/* ORDER FOOTER */}
            <div className="bg-slate-700/50 px-4 py-2 text-xs text-slate-400 flex items-center justify-between">
              <span>{order.items?.length} items</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> Ready now
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PIN CONFIRMATION MODAL */}
      {pendingAction && (
        <WaiterPinConfirmationModal
          isOpen={showPinModal}
          itemName={pendingAction.itemName}
          tableName={pendingAction.tableName}
          onClose={() => {
            setShowPinModal(false);
            setPendingAction(null);
          }}
          onConfirm={handlePinConfirm}
          isLoading={isPinLoading}
        />
      )}
    </div>
  );
}
