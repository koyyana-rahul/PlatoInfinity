/**
 * CHEF/KITCHEN APP (v2 - Real-time)
 * React component for kitchen staff (chefs)
 * Features:
 * - PIN login
 * - Real-time view of their assigned kitchen station items
 * - Claim items, mark as ready (with PIN)
 * - Real-time socket.io updates for a smooth workflow
 */

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../../utils/notify";
import { LogOut, Lock, Clock, CheckCircle, Flame, Heart } from "lucide-react";
import Axios from "../../api/axios";
import { setUserDetails, logout } from "../../store/auth/userSlice";
// import { useSocket } from "../../../socket/SocketProvider"; // Use the central socket provider
import { useSocket } from "../../socket/SocketProvider";
export function ChefKitchenApp() {
  const dispatch = useDispatch();
  const socket = useSocket();
  const authUser = useSelector((state) => state.auth?.user);

  const [view, setView] = useState("login");
  const [staffCode, setStaffCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [confirmPin, setConfirmPin] = useState("");

  const handlePinLogin = async (e) => {
    e.preventDefault();
    // ... (login logic remains the same)
  };

  const loadInitialItems = useCallback(async () => {
    if (!authUser?.kitchenStationId) return;
    try {
      const response = await Axios.get("/api/kitchen/items", {
        params: {
          stationId: authUser.kitchenStationId,
          status: ["NEW", "IN_PROGRESS"],
        },
      });
      if (response.data?.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error("Load items error:", error);
      notify.error("Could not load initial items");
    }
  }, [authUser]);

  useEffect(() => {
    if (view === "kitchen") {
      loadInitialItems();
    }
  }, [view, loadInitialItems]);

  useEffect(() => {
    if (!socket || view !== "kitchen") return;

    const handleNewOrder = (order) => {
      const stationItems = order.items.filter(
        (item) => item.kitchenStationId === authUser?.kitchenStationId,
      );
      if (stationItems.length > 0) {
        setItems((prev) => [...prev, ...stationItems]);
        notify.success(`New order for Table ${order.tableName}`);
        playSound();
      }
    };

    const handleItemUpdate = (update) => {
      setItems((prev) =>
        prev.map((item) =>
          item._id === update.itemId
            ? { ...item, itemStatus: update.itemStatus }
            : item,
        ),
      );
    };

    const handleOrderCancelled = (order) => {
      setItems((prev) => prev.filter((item) => item.orderId !== order.orderId));
      notify.error(`Order for table ${order.tableName} cancelled`);
    };

    socket.on("kitchen:order-new", handleNewOrder);
    socket.on("order:item-status-updated", handleItemUpdate);
    socket.on("kitchen:order-cancelled", handleOrderCancelled);

    return () => {
      socket.off("kitchen:order-new", handleNewOrder);
      socket.off("order:item-status-updated", handleItemUpdate);
      socket.off("kitchen:order-cancelled", handleOrderCancelled);
    };
  }, [socket, view, authUser]);

  const claimItem = async (itemId) => {
    try {
      await Axios.put(`/api/kitchen/item/${itemId}/claim`);
      // Optimistic update handled by socket event
    } catch (error) {
      notify.error("Failed to claim item");
    }
  };

  const markItemReady = async (itemId) => {
    if (pin.length !== 4) return notify.error("PIN must be 4 digits");
    try {
      await Axios.put(`/api/kitchen/item/${itemId}/ready`, { staffPin: pin });
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      setConfirmPin("");
      notify.success("Item marked as ready");
      playSound();
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to mark ready");
    }
  };

  const playSound = () => {
    const audio = new Audio("/kitchen-bell.mp3");
    audio.volume = 0.8;
    audio.play().catch((e) => console.error("Audio play failed:", e));
  };

  const handleLogout = async () => {
    // ... (logout logic remains the same)
  };

  // ... (render logic remains mostly the same, but remove polling-related code)

  return <div>{/* JSX for login and kitchen view */}</div>;
}

export default ChefKitchenApp;
