/**
 * FRONTEND INTEGRATION GUIDE
 *
 * React components and hooks to implement the production-grade system
 * on the client side. Includes PIN entry, cart sync, and failure recovery.
 */

/* ========== 1. PIN ENTRY & VERIFICATION ========== */

import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../api/axios";

export function usePinVerification() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const verifyPin = async (tableId, { onSuccess } = {}) => {
    if (pin.length !== 4) {
      setError("Enter 4-digit PIN");
      return false;
    }

    try {
      setLoading(true);
      setError("");

      const res = await Axios.post("/api/sessions/join", {
        tableId,
        tablePin: pin,
      });

      // ✅ Store session token in localStorage (NOT sessionStorage)
      const sessionToken = res.data?.data?.sessionToken;
      if (sessionToken) {
        localStorage.setItem(`plato:sessionToken:${tableId}`, sessionToken);
        localStorage.setItem(
          `plato:sessionId:${tableId}`,
          res.data?.data?.sessionId,
        );
      }

      toast.success("PIN verified! Welcome!");
      onSuccess?.({ sessionId: res.data?.data?.sessionId });
      return true;
    } catch (err) {
      const message = err.response?.data?.message || "PIN verification failed";

      if (err.response?.status === 429) {
        // Rate limited
        setIsBlocked(true);
        const minutesLeft = err.response?.data?.minutesLeft || 15;
        setBlockTimeRemaining(minutesLeft * 60);

        // Countdown timer
        const interval = setInterval(() => {
          setBlockTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsBlocked(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setError(`PIN blocked for ${minutesLeft} minutes`);
      } else {
        const attemptsLeft = err.response?.data?.attemptsLeft;
        setError(
          message + (attemptsLeft ? ` (${attemptsLeft} attempts left)` : ""),
        );
      }

      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    pin,
    setPin,
    error,
    loading,
    isBlocked,
    blockTimeRemaining,
    verifyPin,
  };
}

export function PinEntryComponent({ tableId, onSuccess }) {
  const {
    pin,
    setPin,
    error,
    loading,
    isBlocked,
    blockTimeRemaining,
    verifyPin,
  } = usePinVerification();

  const handleVerify = () => {
    verifyPin(tableId, { onSuccess });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-sm">
      <h2 className="text-2xl font-bold mb-4">Enter Table PIN</h2>

      {/* PIN INPUT */}
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="••••"
        disabled={isBlocked || loading}
        className="w-full h-14 border-2 rounded-lg text-center text-2xl tracking-widest
                   disabled:bg-gray-100 focus:outline-none focus:border-blue-500"
      />

      {/* ERROR MESSAGE */}
      {error && (
        <p className="mt-2 text-red-500 text-sm font-medium">{error}</p>
      )}

      {/* BLOCKED TIMER */}
      {isBlocked && blockTimeRemaining > 0 && (
        <div className="mt-4 p-3 bg-red-100 rounded-lg">
          <p className="text-red-700 text-sm">
            Too many attempts. Try again in{" "}
            <span className="font-bold">
              {Math.floor(blockTimeRemaining / 60)}
              {blockTimeRemaining % 60 > 0 ? `:${blockTimeRemaining % 60}` : ""}
            </span>
          </p>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <button
        onClick={handleVerify}
        disabled={isBlocked || loading || pin.length !== 4}
        className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-semibold
                   disabled:bg-gray-400 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition"
      >
        {loading ? "Verifying..." : "Verify PIN"}
      </button>
    </div>
  );
}

/* ========== 2. FAMILY MODE CART SYNC ========== */

import { useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

export function useFamilyModeCartSync(sessionId, restaurantId, mode) {
  const socket = useSocket();
  const [cart, setCart] = useState([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    if (!socket || mode !== "FAMILY") return;

    // Join family cart room
    socket.emit("join-family-cart", { sessionId, restaurantId });

    // Listen for updates
    socket.on("cart-synced", ({ items }) => {
      setCart(items);
      setSyncError("");
    });

    socket.on("item-added", ({ item, totalItems }) => {
      setCart((prev) => [...prev, item]);
      toast.success("Item added to cart");
    });

    socket.on("item-updated", ({ item }) => {
      setCart((prev) => prev.map((i) => (i._id === item._id ? item : i)));
    });

    socket.on("item-removed", ({ itemId }) => {
      setCart((prev) => prev.filter((i) => i._id !== itemId));
      toast.success("Item removed");
    });

    socket.on("cart-cleared", () => {
      setCart([]);
    });

    socket.on("participant-joined", ({ participantCount }) => {
      setParticipantCount(participantCount);
      toast.info("Another customer joined");
    });

    socket.on("participant-left", ({ participantCount }) => {
      setParticipantCount(participantCount);
    });

    socket.on("error", ({ message }) => {
      setSyncError(message);
      toast.error(message);
    });

    return () => {
      socket.off("cart-synced");
      socket.off("item-added");
      socket.off("item-updated");
      socket.off("item-removed");
      socket.off("cart-cleared");
      socket.off("participant-joined");
      socket.off("participant-left");
      socket.off("error");
    };
  }, [socket, sessionId, restaurantId, mode]);

  const addToCart = (item) => {
    socket?.emit("add-to-cart", {
      sessionId,
      restaurantId,
      item,
    });
  };

  const updateCartItem = (itemId, quantity) => {
    socket?.emit("update-cart-item", {
      sessionId,
      itemId,
      quantity,
    });
  };

  const removeCartItem = (itemId) => {
    socket?.emit("remove-cart-item", {
      sessionId,
      itemId,
    });
  };

  const clearCart = () => {
    socket?.emit("clear-cart", { sessionId });
  };

  return {
    cart,
    participantCount,
    syncError,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  };
}

/* ========== 3. ORDER PLACEMENT WITH IDEMPOTENCY ========== */

import { v4 as uuidv4 } from "uuid";

export function useOrderPlacement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);

  const placeOrder = async (
    sessionId,
    restaurantId,
    tableId,
    tableName,
    paymentMethod = "CASH",
  ) => {
    try {
      setLoading(true);
      setError("");

      // Generate idempotency key (UUID)
      const idempotencyKey = uuidv4();

      // Attempt to place order
      const res = await Axios.post(
        "/api/orders/place",
        {
          sessionId,
          restaurantId,
          tableId,
          tableName,
          paymentMethod,
          idempotencyKey,
        },
        {
          headers: {
            "idempotency-key": idempotencyKey,
          },
        },
      );

      setOrderId(res.data?.data?.orderId);
      toast.success("Order placed successfully!");
      return res.data?.data;
    } catch (err) {
      const message = err.response?.data?.message || "Order placement failed";

      // If network error, can retry with same idempotencyKey
      if (!err.response?.status) {
        setError(message + " (you can retry safely)");
      } else {
        setError(message);
      }

      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Retry failed order placement
  const retryOrder = async (sessionId, restaurantId, idempotencyKey) => {
    try {
      setLoading(true);
      const res = await Axios.post("/api/orders/resume", {
        sessionId,
        restaurantId,
        idempotencyKey,
      });

      if (res.data?.resumed) {
        // Order was already placed
        toast.success("Your order was already placed!");
        setOrderId(res.data?.orderId);
      } else if (res.data?.readyToRetry) {
        // Ready to place order again
        toast.info("Ready to place order");
      }

      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { placeOrder, retryOrder, loading, error, orderId };
}

/* ========== 4. SESSION RESUME (COOKIE LOSS) ========== */

export function useSessionResume() {
  const [resuming, setResuming] = useState(false);

  const resumeSession = async (tableId, tablePin, restaurantId) => {
    try {
      setResuming(true);

      const res = await Axios.post("/api/sessions/resume", {
        tableId,
        tablePin,
        restaurantId,
      });

      // Store new token
      if (res.data?.sessionToken) {
        localStorage.setItem(
          `plato:sessionToken:${tableId}`,
          res.data.sessionToken,
        );
        localStorage.setItem(`plato:sessionId:${tableId}`, res.data.sessionId);
      }

      toast.success("Session resumed!");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message);
      throw err;
    } finally {
      setResuming(false);
    }
  };

  return { resumeSession, resuming };
}

/* ========== 5. SESSION RECOVERY MODAL ========== */

export function SessionLostModal({ tableId, onRestore, isOpen }) {
  const { resumeSession, resuming } = useSessionResume();
  const [pin, setPin] = useState("");

  const handleRestore = async () => {
    if (pin.length !== 4) {
      toast.error("Enter 4-digit PIN");
      return;
    }

    try {
      const result = await resumeSession(tableId, pin, "restaurantId");
      toast.success("Session restored!");
      onRestore?.(result);
    } catch (err) {
      // Error already toasted
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Session Lost</h3>
        <p className="text-gray-600 mb-6">
          Your session cookies were cleared. Re-enter your PIN to restore your
          cart and orders.
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 4-digit PIN"
          className="w-full border rounded-lg p-3 mb-4 text-center tracking-widest"
        />

        <button
          onClick={handleRestore}
          disabled={resuming || pin.length !== 4}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                     disabled:bg-gray-400"
        >
          {resuming ? "Restoring..." : "Restore Session"}
        </button>
      </div>
    </div>
  );
}

/* ========== 6. KITCHEN DISPLAY COMPONENT ========== */

export function useKitchenDisplay(restaurantId, stationFilter) {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial orders
    const fetchOrders = async () => {
      try {
        const res = await Axios.get("/api/kitchen/orders", {
          params: { restaurantId, stationFilter },
        });
        setOrders(res.data?.orders || []);
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Listen for real-time updates
    if (socket) {
      socket.on("new-order", ({ orderId }) => {
        // Refresh orders list
        fetchOrders();
      });

      socket.on("order-item-updated", ({ orderId, itemIndex, status }) => {
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  items: order.items.map((item, idx) =>
                    idx === itemIndex ? { ...item, status } : item,
                  ),
                }
              : order,
          ),
        );
      });
    }

    return () => {
      socket?.off("new-order");
      socket?.off("order-item-updated");
    };
  }, [restaurantId, stationFilter, socket]);

  const updateItemStatus = async (orderId, itemIndex, newStatus) => {
    try {
      await Axios.patch(
        `/api/kitchen/orders/${orderId}/items/${itemIndex}/status`,
        { newStatus, restaurantId },
      );
      toast.success("Status updated");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return { orders, loading, updateItemStatus };
}

export function KitchenDisplayComponent({ restaurantId }) {
  const { orders, loading, updateItemStatus } = useKitchenDisplay(restaurantId);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <div
          key={order.orderId}
          className={`p-4 rounded-lg border-2 ${
            order.priority === "URGENT"
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
        >
          <h3 className="text-lg font-bold">Table {order.tableNumber}</h3>
          <p className="text-sm text-gray-600">{order.orderAge} min ago</p>

          <div className="mt-4 space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="text-sm">
                <p className="font-medium">
                  {item.quantity}x {item.name}
                </p>
                {item.modifiers.length > 0 && (
                  <p className="text-gray-600 text-xs ml-2">
                    {item.modifiers.map((m) => m.name).join(", ")}
                  </p>
                )}
                <select
                  value={item.status}
                  onChange={(e) =>
                    updateItemStatus(order.orderId, idx, e.target.value)
                  }
                  className="mt-1 w-full text-xs py-1 px-2 border rounded"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">Preparing</option>
                  <option value="READY">Ready</option>
                  <option value="SERVED">Served</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  usePinVerification,
  PinEntryComponent,
  useFamilyModeCartSync,
  useOrderPlacement,
  useSessionResume,
  SessionLostModal,
  useKitchenDisplay,
  KitchenDisplayComponent,
};
