import { io } from "socket.io-client";
import { useEffect } from "react";

let socket;

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
    if (!sessionId || !restaurantId) return;

    socket = io(getSocketUrl(), {
      path: "/socket.io",
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("join:customer", { sessionId, tableId, restaurantId });
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    // Listen for cart updates
    socket.on("cart:update", (data) => {
      console.log("🔄 Cart update received:", data);
      if (onCartUpdate) onCartUpdate(data);
    });

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

    return () => {
      socket.disconnect();
    };
  }, [sessionId, restaurantId, tableId, onCartUpdate, onMenuUpdate]);
}

export function emitCustomerSocketEvent(event, payload, ack) {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Customer socket not connected");
    return false;
  }

  socket.emit(event, payload, ack);
  return true;
}
