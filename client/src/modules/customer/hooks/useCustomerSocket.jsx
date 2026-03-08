import { io } from "socket.io-client";
import { useEffect } from "react";

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

export function useCustomerSocket({
  sessionId,
  restaurantId,
  tableId,
  onCartUpdate,
  onMenuUpdate,
}) {
  useEffect(() => {
    if (!restaurantId || !tableId) return;

    if (!socket) {
      socket = io(getSocketUrl(), {
        path: "/socket.io",
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
    }

    socket.on("connect", () => {
      console.log("✅ Customer socket connected:", socket.id);
      if (sessionId && restaurantId && tableId) {
        socket.emit("join:customer", { sessionId, tableId, restaurantId });
        console.log("📤 Emitted join:customer", { sessionId, tableId, restaurantId });
      } else {
        console.warn("⚠️ Missing sessionId/restaurantId/tableId on connect", { sessionId, restaurantId, tableId });
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn("❌ Customer socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Customer socket connection error:", error);
    });

    const handleCartUpdate = (data) => {
      console.log("🔄 Cart update received:", data);
      if (onCartUpdate) onCartUpdate(data);
    };

    // Listen for cart updates (support both event names)
    socket.on("cart:update", handleCartUpdate);
    socket.on("cart:updated", handleCartUpdate);

    // Listen for menu updates (real-time refresh)
    socket.on("menu:update", (data) => {
      console.log("📢 Menu update received:", data);
      if (onMenuUpdate) onMenuUpdate(data);
    });

    // Listen for individual menu item changes
    socket.on("menu:item:change", (data) => {
      console.log("📝 Menu item changed:", data);
      if (onMenuUpdate) onMenuUpdate(data);
    });

    // Listen for category updates
    socket.on("menu:category:change", (data) => {
      console.log("🏷️ Menu category changed:", data);
      if (onMenuUpdate) onMenuUpdate(data);
    });

    // Listen for real-time order/item status updates
    socket.on("order:item-status-updated", (data) => {
      console.log("📶 Customer: order:item-status-updated", data);
    });

    socket.on("order:item-status", (data) => {
      console.log("📶 Customer: order:item-status", data);
    });

    socket.on("order:item-ready", (data) => {
      console.log("🔔 Customer: order:item-ready", data);
    });

    // Re-join room on reconnect in case server lost room membership
    socket.on("reconnect", () => {
      console.log("🔄 Socket reconnected, re-joining customer room");
      if (sessionId && restaurantId && tableId) {
        socket.emit("join:customer", { sessionId, tableId, restaurantId });
      }
    });

    return () => {
      socket.off("cart:update", handleCartUpdate);
      socket.off("cart:updated", handleCartUpdate);
      socket.off("menu:update");
      socket.off("menu:item:change");
      socket.off("menu:category:change");
      socket.off("order:item-status-updated");
      socket.off("order:item-status");
      socket.off("order:item-ready");
      socket.off("reconnect");
    };
  }, [sessionId, restaurantId, tableId, onCartUpdate, onMenuUpdate]);
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
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
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
    const connected = await ensureCustomerSocketConnection({
      restaurantId,
      tableId,
      sessionId: localStorage.getItem(`plato:customerSession:${tableId}`),
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
