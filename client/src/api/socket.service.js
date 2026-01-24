/**
 * socket.service.js
 *
 * Real-time Socket.io integration for:
 * - FAMILY mode cart synchronization
 * - Order status updates
 * - Kitchen order notifications
 * - Live customer presence
 * - Payment notifications
 */

import io from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.restaurantId = null;
    this.listeners = {};
  }

  /* ========== CONNECTION ========== */
  connect(sessionToken) {
    if (this.socket?.connected) {
      console.log("✅ Socket already connected");
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const url = import.meta.env.VITE_API_URL || "http://localhost:8080";

        this.socket = io(url, {
          auth: {
            sessionToken,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        /* ========== CONNECTION EVENTS ========== */
        this.socket.on("connect", () => {
          console.log("🔌 Socket connected:", this.socket.id);
          this.emit("connected");
          resolve();
        });

        this.socket.on("disconnect", () => {
          console.log("🔌 Socket disconnected");
          this.emit("disconnected");
        });

        this.socket.on("connect_error", (err) => {
          console.error("🔴 Socket connection error:", err);
          this.emit("error", err);
          reject(err);
        });

        this.socket.on("reconnect", () => {
          console.log("🟢 Socket reconnected");
          this.emit("reconnected");
        });

        this.socket.on("reconnect_attempt", () => {
          console.log("🟡 Reconnecting...");
        });

        // Set timeout for connection
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error("Socket connection timeout"));
          }
        }, 10000);
      } catch (err) {
        console.error("Socket connection error:", err);
        reject(err);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("🔌 Socket disconnected");
    }
  }

  /* ========== JOIN/LEAVE ROOMS ========== */
  joinSessionRoom(sessionId, restaurantId) {
    if (!this.socket?.connected) {
      console.warn("⚠️ Socket not connected");
      return;
    }

    this.sessionId = sessionId;
    this.restaurantId = restaurantId;

    this.socket.emit("join:session", {
      sessionId,
      restaurantId,
    });

    console.log(`✅ Joined session room: ${sessionId}`);
  }

  leaveSessionRoom(sessionId) {
    if (!this.socket?.connected) return;

    this.socket.emit("leave:session", { sessionId });
    console.log(`✅ Left session room: ${sessionId}`);
  }

  joinKitchenRoom(restaurantId) {
    if (!this.socket?.connected) {
      console.warn("⚠️ Socket not connected");
      return;
    }

    this.socket.emit("join:kitchen", { restaurantId });
    console.log(`✅ Joined kitchen room: ${restaurantId}`);
  }

  /* ========== FAMILY MODE: CART SYNC ========== */
  /**
   * Real-time cart synchronization for FAMILY mode
   * All devices see the same cart in real-time
   */
  onCartUpdated(callback) {
    this.on("cart:updated", callback);
  }

  offCartUpdated() {
    this.off("cart:updated");
  }

  broadcastCartUpdate(cartData) {
    if (!this.socket?.connected) {
      console.warn("⚠️ Socket not connected");
      return;
    }

    this.socket.emit("cart:update", {
      sessionId: this.sessionId,
      cart: cartData,
    });

    console.log("📡 Cart update broadcasted");
  }

  /* ========== ORDER STATUS UPDATES ========== */
  /**
   * Receive real-time order status changes
   */
  onOrderStatusChanged(callback) {
    this.on("order:statusChanged", callback);
  }

  offOrderStatusChanged() {
    this.off("order:statusChanged");
  }

  /* ========== ORDER ITEM UPDATES (KITCHEN) ========== */
  /**
   * Kitchen staff see real-time item status updates
   */
  onOrderItemStatusChanged(callback) {
    this.on("order:itemStatusChanged", callback);
  }

  offOrderItemStatusChanged() {
    this.off("order:itemStatusChanged");
  }

  /* ========== NEW ORDER NOTIFICATION (KITCHEN) ========== */
  /**
   * Kitchen gets notified when new order is placed
   */
  onNewOrder(callback) {
    this.on("order:new", callback);
  }

  offNewOrder() {
    this.off("order:new");
  }

  /* ========== PAYMENT NOTIFICATIONS ========== */
  onPaymentCompleted(callback) {
    this.on("payment:completed", callback);
  }

  offPaymentCompleted() {
    this.off("payment:completed");
  }

  /* ========== CUSTOMER PRESENCE (FAMILY MODE) ========== */
  /**
   * Track which devices are active in FAMILY mode
   */
  onCustomerJoined(callback) {
    this.on("customer:joined", callback);
  }

  offCustomerJoined() {
    this.off("customer:joined");
  }

  onCustomerLeft(callback) {
    this.on("customer:left", callback);
  }

  offCustomerLeft() {
    this.off("customer:left");
  }

  /* ========== SESSION CLOSED ========== */
  onSessionClosed(callback) {
    this.on("session:closed", callback);
  }

  offSessionClosed() {
    this.off("session:closed");
  }

  /* ========== GENERIC EVENT HANDLERS ========== */
  on(event, callback) {
    if (!this.socket) {
      console.warn("⚠️ Socket not initialized");
      return;
    }

    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);

    this.socket.on(event, callback);
    console.log(`📡 Listening to: ${event}`);
  }

  off(event) {
    if (!this.socket) return;

    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        this.socket.off(event, callback);
      });
      delete this.listeners[event];
    }

    console.log(`🔇 Stopped listening to: ${event}`);
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn("⚠️ Socket not connected, queuing event:", event);
      return;
    }

    this.socket.emit(event, data);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();

export default socketService;
