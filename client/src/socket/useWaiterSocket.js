import { useEffect } from "react";
import { useSocket } from "./SocketProvider";

export default function useWaiterSocket(onUpdate) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !onUpdate) return;

    const handleSocketSync = () => onUpdate?.({ _event: "connect" });

    const events = [
      "order:new",
      "order:placed",
      "order:item-status-updated",
      "order:status-changed",
      "manager:order-status-changed",
      "order:ready",
      "order:ready-for-serving",
      "order:served",
      "order:cancelled",
      "table:item-status-changed",
      "waiter:item-ready-alert",
      "session:update",
    ];

    events.forEach((eventName) => socket.on(eventName, onUpdate));
    socket.on("connect", handleSocketSync);

    return () => {
      events.forEach((eventName) => socket.off(eventName, onUpdate));
      socket.off("connect", handleSocketSync);
    };
  }, [socket, onUpdate]);
}
