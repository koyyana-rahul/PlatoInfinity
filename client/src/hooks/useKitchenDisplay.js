/**
 * useKitchenDisplay.js
 *
 * Custom React hook for kitchen display system:
 * - Fetch orders without pricing
 * - Real-time order updates via Socket.io
 * - Update item status (prep progress)
 * - Sort by urgency and preparation time
 * - No sensitive customer data
 */

import { useState, useCallback, useEffect } from "react";
import Axios from "../api/axios";
import orderApi from "../api/order.api";
import toast from "react-hot-toast";
import { socketService } from "../api/socket.service";
import { useSocket } from "../socket/SocketProvider";

export function useKitchenDisplay(restaurantId, stationFilter = null) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  const socket = useSocket(); // Get socket from SocketProvider

  // Set socket instance in socketService when available
  useEffect(() => {
    if (socket && socket.connected) {
      socketService.setSocket(socket);
      setSocketReady(true);
    }
  }, [socket]);

  /* ========== FETCH KITCHEN ORDERS (NO PRICING) ========== */
  const fetchKitchenOrders = useCallback(async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const res = await Axios(
        orderApi.getKitchenOrders(restaurantId, {
          stationFilter,
        }),
      );

      const ordersList = res.data?.data?.orders || [];
      setOrders(ordersList);

      console.log(
        `🍳 Kitchen orders fetched: ${ordersList.length} orders (no pricing)`,
      );
    } catch (err) {
      console.error("❌ Failed to fetch kitchen orders:", err);
      toast.error("Failed to load kitchen orders");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, stationFilter]);

  /* ========== UPDATE ITEM STATUS ========== */
  const updateItemStatus = useCallback(
    async (orderId, itemIndex, newStatus) => {
      try {
        setUpdatingOrder(orderId);

        const res = await Axios({
          ...orderApi.updateKitchenItemStatus(orderId, itemIndex),
          data: { status: newStatus },
        });

        const updatedOrder = res.data?.data?.order;

        // Update local state
        setOrders((prevOrders) => {
          const idx = prevOrders.findIndex((o) => o.orderId === orderId);
          if (idx >= 0) {
            const newOrders = [...prevOrders];
            newOrders[idx] = updatedOrder;
            return newOrders;
          }
          return prevOrders;
        });

        const statusEmoji =
          {
            IN_PROGRESS: "👨‍🍳",
            READY: "✅",
            SERVED: "🚚",
            CANCELLED: "❌",
          }[newStatus] || "📝";

        console.log(`${statusEmoji} Item status updated: ${newStatus}`);
        toast.success(`Item marked as ${newStatus}`);

        return true;
      } catch (err) {
        console.error("❌ Failed to update item status:", err);
        toast.error("Failed to update item status");
        return false;
      } finally {
        setUpdatingOrder(null);
      }
    },
    [],
  );

  /* ========== LISTEN FOR NEW ORDERS ========== */
  const listenForNewOrders = useCallback(() => {
    socketService.onNewOrder((newOrder) => {
      console.log("🆕 New order received:", newOrder);

      // Add to beginning of orders list
      setOrders((prevOrders) => {
        const exists = prevOrders.some((o) => o.orderId === newOrder.orderId);
        if (!exists) {
          return [newOrder, ...prevOrders];
        }
        return prevOrders;
      });

      // Play notification sound
      playNotificationSound();
    });
  }, []);

  /* ========== LISTEN FOR ORDER ITEM UPDATES ========== */
  const listenForItemUpdates = useCallback(() => {
    socketService.onOrderItemStatusChanged((itemUpdate) => {
      console.log("📡 Item status changed:", itemUpdate);

      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.orderId === itemUpdate.orderId) {
            const newItems = [...(order.items || [])];
            if (newItems[itemUpdate.itemIndex]) {
              // Update the item status
              newItems[itemUpdate.itemIndex] = {
                ...newItems[itemUpdate.itemIndex],
                itemStatus: itemUpdate.itemStatus,
                status: itemUpdate.itemStatus,
                updatedAt: itemUpdate.updatedAt,
              };
            }
            return { ...order, items: newItems };
          }
          return order;
        });
      });

      // Show toast notification for status changes
      if (itemUpdate.itemStatus === "READY") {
        playNotificationSound();
      }
    });
  }, []);

  /* ========== LISTEN FOR SESSION CLOSED ========== */
  const listenForSessionClose = useCallback(() => {
    socketService.onSessionClosed((sessionData) => {
      console.log("🔒 Session closed:", sessionData.sessionId);

      // Remove orders from closed session
      setOrders((prevOrders) =>
        prevOrders.filter((o) => o.sessionId !== sessionData.sessionId),
      );
    });
  }, []);

  /* ========== PLAY NOTIFICATION SOUND ========== */
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context and play a simple beep
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      // Fail silently if audio not available
      console.log("Audio notification unavailable");
    }
  }, []);

  /* ========== SETUP SOCKET LISTENERS ========== */
  useEffect(() => {
    if (socketReady && socketService.isConnected()) {
      listenForNewOrders();
      listenForItemUpdates();
      listenForSessionClose();

      return () => {
        socketService.offNewOrder();
        socketService.offOrderItemStatusChanged();
        socketService.offSessionClosed();
      };
    }
  }, [
    socketReady,
    listenForNewOrders,
    listenForItemUpdates,
    listenForSessionClose,
  ]);

  /* ========== INITIAL LOAD ========== */
  useEffect(() => {
    if (restaurantId) {
      fetchKitchenOrders();

      // Refresh every 30 seconds as fallback
      const interval = setInterval(() => {
        fetchKitchenOrders();
      }, 30 * 1000);

      return () => clearInterval(interval);
    }
  }, [restaurantId, fetchKitchenOrders]);

  return {
    orders,
    loading,
    updatingOrder,
    socketReady,

    // Methods
    fetchKitchenOrders,
    updateItemStatus,
  };
}

export default useKitchenDisplay;
