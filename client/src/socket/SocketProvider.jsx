import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const restaurantId = useSelector((s) => s.user.restaurantId);

  useEffect(() => {
    if (!restaurantId) return;

    socketRef.current = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socketRef.current.emit("join", {
      room: `restaurant:${restaurantId}:waiters`,
    });

    return () => socketRef.current?.disconnect();
  }, [restaurantId]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);