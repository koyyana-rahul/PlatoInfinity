import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext(null);

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL)
    return import.meta.env.VITE_API_BASE_URL;

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8080";
    }
  }

  return "http://localhost:8080";
};

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const restaurantId = useSelector((s) => s.user.restaurantId);
  const role = useSelector((s) => s.user.role);

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken");

    const isStaffRole = [
      "BRAND_ADMIN",
      "ADMIN",
      "OWNER",
      "MANAGER",
      "CHEF",
      "WAITER",
      "CASHIER",
    ].includes(role);

    // Customer uses separate socket hook/provider.
    if (role === "CUSTOMER") {
      console.log(
        "🔌 SocketProvider: Customer role detected, skipping staff socket",
      );
      return;
    }

    // Until role loads, avoid opening an unauthenticated socket accidentally.
    if (!role) return;

    // Staff/admin can authenticate via localStorage token OR httpOnly accessToken cookie.
    if (!token && !isStaffRole) {
      console.log(
        "🔌 SocketProvider: Missing token and non-staff role, skipping socket",
      );
      return;
    }

    console.log("🔌 SocketProvider: Creating authenticated socket", {
      restaurantId,
      role,
      hasToken: !!token,
    });

    const nextSocket = io(getSocketUrl(), {
      withCredentials: true,
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket", "polling"], // Try websocket first, fall back to polling
    });

    nextSocket.on("connect", () => {
      console.log("✅ SocketProvider: Socket connected:", nextSocket.id);

      if (restaurantId) {
        nextSocket.emit("join:restaurant", { restaurantId });
      }
    });

    nextSocket.on("reconnect", () => {
      if (restaurantId) {
        nextSocket.emit("join:restaurant", { restaurantId });
      }
    });

    nextSocket.on("connect_error", (error) => {
      console.error("❌ SocketProvider: Socket connection error:", error);
    });

    setSocket(nextSocket);

    return () => {
      console.log("🔌 SocketProvider: Disconnecting socket");
      nextSocket.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, role]);

  useEffect(() => {
    if (!socket || !socket.connected || !restaurantId) return;
    socket.emit("join:restaurant", { restaurantId });
  }, [socket, restaurantId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
