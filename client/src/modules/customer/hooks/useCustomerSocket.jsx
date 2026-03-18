import { io } from "socket.io-client";
import { useEffect, useState } from "react";

let socket;
let connectPromise = null;

// Get the same API URL as axios uses
const getSocketUrl = () => {
  // 1️⃣ Explicit env override
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2️⃣ Local development
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8080";
    }
  }

  // 3️⃣ Fallback
  return "http://localhost:8080";
};

const parseMaybeJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const resolveCustomerContext = ({ sessionId, restaurantId, tableId }) => {
  const fallbackTableId =
    tableId ||
    localStorage.getItem("plato_table_id") ||
    localStorage.getItem("plato:lastTableId") ||
    null;

  const sessionKey = fallbackTableId
    ? `plato:customerSession:${fallbackTableId}`
    : null;
  const storedSessionRaw = sessionKey ? localStorage.getItem(sessionKey) : null;
  const storedSessionParsed = parseMaybeJson(storedSessionRaw);

  const fallbackSessionId =
    sessionId ||
    storedSessionParsed?.sessionId ||
    storedSessionParsed?._id ||
    storedSessionParsed?.id ||
    storedSessionRaw ||
    localStorage.getItem("plato_session_token") ||
    null;

  const fallbackRestaurantId =
    restaurantId || storedSessionParsed?.restaurantId || null;

  return {
    sessionId: fallbackSessionId ? String(fallbackSessionId) : null,
    restaurantId: fallbackRestaurantId ? String(fallbackRestaurantId) : null,
    tableId: fallbackTableId ? String(fallbackTableId) : null,
  };
};

export function useCustomerSocket({
  sessionId,
  restaurantId,
  tableId,
  onCartUpdate,
  onMenuUpdate,
}) {
  const [socketInstance, setSocketInstance] = useState(socket || null);

  useEffect(() => {
    const resolved = resolveCustomerContext({
      sessionId,
      restaurantId,
      tableId,
    });

    if (!socket) {
      socket = io(getSocketUrl(), {
        path: "/socket.io",
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
    }
    setSocketInstance(socket);

    const joinCustomerRoom = () => {
      if (resolved.sessionId && resolved.tableId) {
        socket.emit("join:customer", {
          sessionId: resolved.sessionId,
          tableId: resolved.tableId,
          restaurantId: resolved.restaurantId || undefined,
        });
        console.log("📤 Emitted join:customer", {
          sessionId: resolved.sessionId,
          tableId: resolved.tableId,
          restaurantId: resolved.restaurantId || "(fallback-pending)",
        });
      } else {
        console.warn("⚠️ Missing sessionId/tableId for customer socket join", {
          sessionId: resolved.sessionId,
          restaurantId: resolved.restaurantId,
          tableId: resolved.tableId,
        });
      }
    };

    const handleConnect = () => {
      console.log("✅ Customer socket connected:", socket.id);
      joinCustomerRoom();
    };

    const handleDisconnect = (reason) => {
      console.warn("❌ Customer socket disconnected:", reason);
    };

    const handleConnectError = (error) => {
      console.error("❌ Customer socket connection error:", error);
    };

    const handleReconnect = () => {
      console.log("🔄 Socket reconnected, re-joining customer room");
      joinCustomerRoom();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect", handleReconnect);

    // If already connected and params changed, re-join immediately
    if (socket.connected) {
      joinCustomerRoom();
    }

    const handleCartUpdate = (data) => {
      console.log("🔄 Cart update received:", data);
      if (onCartUpdate) onCartUpdate(data);
    };

    // Listen for cart updates (support both event names)
    socket.on("cart:update", handleCartUpdate);
    socket.on("cart:updated", handleCartUpdate);

    const handleMenuUpdate = (data) => {
      console.log("📢 Menu update received:", data);
      if (onMenuUpdate) onMenuUpdate(data);
    };

    const handleMenuItemChange = (data) => {
      console.log("📝 Menu item changed:", data);
      if (onMenuUpdate) onMenuUpdate(data);
    };

    const handleMenuCategoryChange = (data) => {
      console.log("🏷️ Menu category changed:", data);
      if (onMenuUpdate) onMenuUpdate(data);
    };

    const handleOrderItemStatusUpdated = (data) => {
      console.log("📶 Customer: order:item-status-updated", data);
    };

    const handleOrderItemStatus = (data) => {
      console.log("📶 Customer: order:item-status", data);
    };

    const handleOrderItemReady = (data) => {
      console.log("🔔 Customer: order:item-ready", data);
    };

    const handleOrderPlaced = (data) => {
      console.log("📦 Customer: order:placed", data);
    };

    const handleOrderConfirmed = (data) => {
      console.log("✅ Customer: order:confirmed", data);
    };

    // Listen for menu updates (real-time refresh)
    socket.on("menu:update", handleMenuUpdate);
    socket.on("menu:item:change", handleMenuItemChange);
    socket.on("menu:category:change", handleMenuCategoryChange);

    // Listen for real-time order/item status updates
    socket.on("order:item-status-updated", handleOrderItemStatusUpdated);
    socket.on("order:item-status", handleOrderItemStatus);
    socket.on("order:item-ready", handleOrderItemReady);
    socket.on("order:placed", handleOrderPlaced);
    socket.on("order:confirmed", handleOrderConfirmed);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect", handleReconnect);
      socket.off("cart:update", handleCartUpdate);
      socket.off("cart:updated", handleCartUpdate);
      socket.off("menu:update", handleMenuUpdate);
      socket.off("menu:item:change", handleMenuItemChange);
      socket.off("menu:category:change", handleMenuCategoryChange);
      socket.off("order:item-status-updated", handleOrderItemStatusUpdated);
      socket.off("order:item-status", handleOrderItemStatus);
      socket.off("order:item-ready", handleOrderItemReady);
      socket.off("order:placed", handleOrderPlaced);
      socket.off("order:confirmed", handleOrderConfirmed);
    };
  }, [sessionId, restaurantId, tableId, onCartUpdate, onMenuUpdate]);

  return socketInstance;
}

export async function ensureCustomerSocketConnection({
  sessionId,
  restaurantId,
  tableId,
}) {
  if (!restaurantId || !tableId) {
    console.warn("⚠️ Missing restaurantId or tableId", {
      restaurantId,
      tableId,
    });
    return false;
  }

  if (socket?.connected) {
    console.log("✅ Socket already connected, joining customer room...", {
      sessionId,
      restaurantId,
      tableId,
    });
    socket.emit("join:customer", { sessionId, tableId, restaurantId });
    await new Promise((res) => setTimeout(res, 200));
    return true;
  }

  if (!socket) {
    console.log("🔌 Creating new socket connection...");
    socket = io(getSocketUrl(), {
      path: "/socket.io",
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });
  }

  if (!connectPromise) {
    console.log("⏳ Waiting for socket to connect...");
    connectPromise = new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn("⏱️ Socket connection timeout (4s)");
        resolve(false);
      }, 4000);

      socket.once("connect", () => {
        clearTimeout(timeout);
        console.log("✅ Socket connected, socket.id:", socket.id);
        resolve(true);
      });

      socket.once("connect_error", (error) => {
        clearTimeout(timeout);
        console.error("❌ Socket connection error:", error);
        resolve(false);
      });
    }).finally(() => {
      connectPromise = null;
    });
  }

  const connected = await connectPromise;
  if (connected) {
    console.log("✅ Socket connected, now emitting join:customer...", {
      sessionId,
      tableId,
      restaurantId,
    });
    socket.emit("join:customer", { sessionId, tableId, restaurantId });
    await new Promise((res) => setTimeout(res, 200));
  } else {
    console.error("❌ Failed to connect socket");
  }

  return connected;
}

export async function emitCustomerSocketEvent(event, payload, ack) {
  console.log("📤 Emitting event:", event, "payload:", payload);

  if (!socket) {
    console.error("❌ Socket not initialized");
    return false;
  }

  if (!socket.connected) {
    console.warn(
      "⚠️ Customer socket not connected (connected:",
      socket.connected,
      "), attempting to ensure connection...",
    );
    const { restaurantId, tableId } = payload;
    const rawSession = tableId
      ? localStorage.getItem(`plato:customerSession:${tableId}`)
      : null;
    let parsedSessionId = null;
    try {
      const parsed = rawSession ? JSON.parse(rawSession) : null;
      parsedSessionId = parsed?.sessionId || parsed?._id || parsed?.id || null;
    } catch {
      parsedSessionId = rawSession || null;
    }

    const connected = await ensureCustomerSocketConnection({
      restaurantId,
      tableId,
      sessionId: parsedSessionId,
    });

    if (!connected) {
      console.error("❌ Could not establish socket connection");
      return false;
    }
  }

  if (!socket.connected) {
    console.error("❌ Socket still not connected after ensure attempt");
    return false;
  }

  console.log("📤 Emitting:", event, "to socket:", socket.id);
  socket.emit(event, payload, (response) => {
    console.log("📬 Ack received for", event, ":", response);
    if (ack) ack(response);
  });
  return true;
}
