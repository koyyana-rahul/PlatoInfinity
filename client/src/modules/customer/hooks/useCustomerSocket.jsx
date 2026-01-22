import { io } from "socket.io-client";
import { useEffect } from "react";

let socket;

export function useCustomerSocket({ sessionId, onCartUpdate }) {
  useEffect(() => {
    if (!sessionId) return;

    socket = io(import.meta.env.VITE_API_URL, {
      path: "/socket.io",
      auth: {
        token: localStorage.getItem("x-session-token"),
      },
    });

    socket.emit("join:customer", { sessionId });

    socket.on("cart:update", onCartUpdate);

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);
}