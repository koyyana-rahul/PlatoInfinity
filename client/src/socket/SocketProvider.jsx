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

  useEffect(() => {
    if (!restaurantId) {
      console.log("🔌 SocketProvider: No restaurantId, disconnecting socket");
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    console.log(
      "🔌 SocketProvider: Creating socket for restaurant:",
      restaurantId,
    );

    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken");

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
  }, [restaurantId]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
