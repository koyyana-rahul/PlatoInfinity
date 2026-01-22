import { useEffect } from "react";
import { useSocket } from "./SocketProvider";

export default function useWaiterSocket(onUpdate) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !onUpdate) return;

    socket.on("order:new", onUpdate);
    socket.on("order:ready", onUpdate);
    socket.on("order:served", onUpdate);
    socket.on("session:update", onUpdate);

    return () => {
      socket.off("order:new", onUpdate);
      socket.off("order:ready", onUpdate);
      socket.off("order:served", onUpdate);
      socket.off("session:update", onUpdate);
    };
  }, [socket, onUpdate]);
}