import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import StationQueueEvent from "../models/stationQueueEvent.model.js";
import Order from "../models/order.model.js";
import { registerSocket } from "./emitter.js";

let io;

/* =====================================================
   INIT SOCKET SERVER
===================================================== */
export function initSocketServer(httpServer, options = {}) {
  io = new SocketIOServer(httpServer, {
    path: options.path || "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  /**
   * Register socket instance in emitter module
   * This allows all controllers to emit events
   */
  registerSocket(io);

  /* ================= SOCKET AUTH ================= */
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      // 🔄 TRY JWT FIRST (for staff/admin/manager/chef)
      if (token) {
        try {
          const payload = jwt.verify(
            token,
            process.env.JWT_SECRET_ACCESS || process.env.JWT_SECRET,
          );

          const userId = payload.sub || payload._id;
          const user = await UserModel.findById(userId).lean();
          if (!user) return next(new Error("User not found"));

          socket.user = {
            id: String(user._id),
            name: user.name,
            role: user.role,
            restaurantId: String(user.restaurantId),
            station: user.kitchenStation || null,
          };

          return next();
        } catch (jwtErr) {
          // JWT verification failed, treat as customer session token
          console.log("JWT failed, treating as customer session token");
        }
      }

      // 👥 CUSTOMER SESSION TOKEN (no token required initially)
      // Allow customer connections - they'll pass sessionId in join:customer event
      socket.user = {
        id: "customer",
        role: "CUSTOMER",
        restaurantId: null, // Will be set in join:customer
        station: null,
      };

      next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", (socket) => {
    const user = socket.user;

    console.log(
      `🔌 ${socket.id} connected | ${user.role} | restaurant=${user.restaurantId}`,
    );

    // Skip base room for customers (they'll join explicitly)
    if (user.role !== "CUSTOMER" && user.restaurantId) {
      /* ---------- BASE ROOM ---------- */
      socket.join(`restaurant:${user.restaurantId}`);

      /* ---------- MANAGER ROOM ---------- */
      if (user.role === "MANAGER" || user.role === "BRAND_ADMIN") {
        socket.join(`restaurant:${user.restaurantId}:managers`);
      }

      /* ---------- WAITER ROOM ---------- */
      if (user.role === "WAITER" || user.role === "MANAGER") {
        socket.join(`restaurant:${user.restaurantId}:waiters`);
      }

      /* ---------- CHEF ROOM ---------- */
      if (user.role === "CHEF" && user.station) {
        socket.join(`restaurant:${user.restaurantId}:station:${user.station}`);
        socket.join(`restaurant:${user.restaurantId}:kitchen`);
      }

      /* ---------- CASHIER ROOM ---------- */
      if (user.role === "CASHIER") {
        socket.join(`restaurant:${user.restaurantId}:cashier`);
      }

      /* ---------- USER-SPECIFIC ROOM (for direct notifications) ---------- */
      socket.join(`user:${user.id}`);
    }

    /* ---------- CUSTOMER JOINS ---------- */
    socket.on("join:customer", ({ sessionId, tableId, restaurantId }) => {
      if (restaurantId) {
        socket.join(`restaurant:${restaurantId}:customers`);
        socket.join(`session:${sessionId}`);
        console.log(
          `👥 Customer joined: session:${sessionId} | restaurant:${restaurantId}`,
        );
      }
    });

    /* ================= CHEF KITCHEN EVENTS ================= */

    /**
     * Chef claims an item from queue
     */
    socket.on("kitchen:claim-item", async ({ orderId, itemIndex }, ack) => {
      try {
        if (user.role !== "CHEF") {
          return ack({ ok: false, error: "Not authorized" });
        }

        const order = await Order.findById(orderId);
        if (!order) return ack({ ok: false, error: "Order not found" });

        const item = order.items[itemIndex];
        if (!item) return ack({ ok: false, error: "Item not found" });

        if (item.itemStatus !== "NEW") {
          return ack({
            ok: false,
            error: "Item already claimed",
          });
        }

        // Update item status
        item.itemStatus = "IN_PROGRESS";
        item.chefId = user.id;
        item.claimedAt = new Date();

        await order.save();

        // Emit to all relevant parties
        io.to(`restaurant:${user.restaurantId}`).emit("order:item-claimed", {
          orderId,
          itemIndex,
          itemName: item.name,
          chefName: user.name,
          station: item.station,
          claimedAt: item.claimedAt,
        });

        io.to(`session:${order.sessionId}`).emit("order:item-status", {
          orderId,
          itemIndex,
          itemName: item.name,
          status: "IN_PROGRESS",
        });

        ack({ ok: true });
      } catch (err) {
        console.error("kitchen:claim-item error:", err);
        ack({ ok: false, error: err.message });
      }
    });

    /**
     * Chef marks item as ready
     */
    socket.on("kitchen:mark-ready", async ({ orderId, itemIndex }, ack) => {
      try {
        if (user.role !== "CHEF") {
          return ack({ ok: false, error: "Not authorized" });
        }

        const order = await Order.findById(orderId);
        if (!order) return ack({ ok: false, error: "Order not found" });

        const item = order.items[itemIndex];
        if (!item) return ack({ ok: false, error: "Item not found" });

        // Update item status
        item.itemStatus = "READY";
        item.readyAt = new Date();

        // Check if all items in order are ready
        const allReady = order.items.every((i) => i.itemStatus === "READY");

        await order.save();

        // Emit to waiter - item ready for serving
        io.to(`restaurant:${user.restaurantId}:waiters`).emit(
          "order:item-ready",
          {
            orderId,
            itemIndex,
            itemName: item.name,
            tableId: order.tableId,
            tableName: order.tableName,
            allReady,
          },
        );

        // Emit to customer
        io.to(`session:${order.sessionId}`).emit("order:item-ready", {
          orderId,
          itemName: item.name,
          itemStatus: "READY",
          allReady,
        });

        // If all items ready, notify kitchen
        if (allReady) {
          io.to(`restaurant:${user.restaurantId}`).emit(
            "order:ready-for-serving",
            {
              orderId,
              tableName: order.tableName,
            },
          );
        }

        ack({ ok: true });
      } catch (err) {
        console.error("kitchen:mark-ready error:", err);
        ack({ ok: false, error: err.message });
      }
    });

    /**
     * Station/Kitchen queue update (send to all chefs at station)
     */
    socket.on("station:event:claim", async ({ eventId }, ack) => {
      try {
        const event = await StationQueueEvent.findById(eventId);
        if (!event) return ack({ ok: false });

        event.status = "PREPARING";
        event.claimedBy = user.id;
        event.claimedAt = new Date();
        await event.save();

        io.to(`restaurant:${user.restaurantId}`).emit("station:event:updated", {
          eventId,
          status: "PREPARING",
        });

        ack({ ok: true });
      } catch (err) {
        console.error("station:event:claim error:", err);
        ack({ ok: false });
      }
    });

    socket.on("station:event:update", async ({ eventId, status }, ack) => {
      try {
        const event = await StationQueueEvent.findById(eventId);
        if (!event) return ack({ ok: false });

        event.status = status;
        if (status === "READY") event.readyAt = new Date();
        if (status === "SERVED") event.servedAt = new Date();
        await event.save();

        io.to(`restaurant:${user.restaurantId}`).emit("station:event:updated", {
          eventId,
          status,
          tableId: event.tableId,
          orderId: event.orderId,
        });

        ack({ ok: true });
      } catch (err) {
        console.error("station:event:update error:", err);
        ack({ ok: false });
      }
    });

    /* ================= WAITER EVENTS ================= */

    /**
     * Waiter serves an order
     */
    socket.on("waiter:serve-item", async ({ orderId, itemIndex }, ack) => {
      try {
        if (!["WAITER", "MANAGER"].includes(user.role)) {
          return ack({ ok: false, error: "Not authorized" });
        }

        const order = await Order.findById(orderId);
        if (!order) return ack({ ok: false, error: "Order not found" });

        const item = order.items[itemIndex];
        if (!item) return ack({ ok: false, error: "Item not found" });

        // Update item status
        item.itemStatus = "SERVED";
        item.waiterId = user.id;
        item.servedAt = new Date();

        // Check if all items served
        const allServed = order.items.every((i) => i.itemStatus === "SERVED");

        await order.save();

        // Emit order served event
        io.to(`restaurant:${user.restaurantId}`).emit("order:item-served", {
          orderId,
          itemIndex,
          itemName: item.name,
          tableId: order.tableId,
          tableName: order.tableName,
          allServed,
        });

        io.to(`session:${order.sessionId}`).emit("order:item-served", {
          orderId,
          itemName: item.name,
          allServed,
        });

        ack({ ok: true });
      } catch (err) {
        console.error("waiter:serve-item error:", err);
        ack({ ok: false, error: err.message });
      }
    });

    /* ================= KITCHEN STATION EVENTS ================= */

    /**
     * Chef comes online / goes offline
     */
    socket.on("kitchen:status-update", ({ status }, ack) => {
      try {
        if (user.role !== "CHEF")
          return ack({ ok: false, error: "Not authorized" });

        // Broadcast chef status to all kitchen staff
        io.to(`restaurant:${user.restaurantId}:kitchen`).emit(
          "kitchen:chef-status",
          {
            chefId: user.id,
            chefName: user.name,
            status, // "online" | "offline" | "on-break"
            timestamp: new Date(),
          },
        );

        ack({ ok: true });
      } catch (err) {
        console.error("kitchen:status-update error:", err);
        ack({ ok: false });
      }
    });

    /**
     * Request waiter for item pickup
     */
    socket.on(
      "kitchen:item-ready-alert",
      ({ orderId, itemId, tableId, tableName }, ack) => {
        try {
          if (user.role !== "CHEF") return ack({ ok: false });

          // Alert all waiters in the restaurant
          io.to(`restaurant:${user.restaurantId}:waiters`).emit(
            "waiter:item-ready-alert",
            {
              orderId,
              itemId,
              tableId,
              tableName,
              chefName: user.name,
              timestamp: new Date(),
            },
          );

          ack({ ok: true });
        } catch (err) {
          console.error("kitchen:item-ready-alert error:", err);
          ack({ ok: false });
        }
      },
    );

    /* ================= WAITER REAL-TIME EVENTS ================= */

    /**
     * Waiter comes online / goes offline
     */
    socket.on("waiter:status-update", ({ status }, ack) => {
      try {
        if (user.role !== "WAITER") return ack({ ok: false });

        // Broadcast waiter status to managers and other waiters
        io.to(`restaurant:${user.restaurantId}:waiters`).emit(
          "waiter:staff-status",
          {
            waiterId: user.id,
            waiterName: user.name,
            status, // "online" | "offline" | "on-break"
            timestamp: new Date(),
          },
        );

        // Also notify managers
        io.to(`restaurant:${user.restaurantId}:managers`).emit(
          "waiter:staff-status",
          {
            waiterId: user.id,
            waiterName: user.name,
            status,
            timestamp: new Date(),
          },
        );

        ack({ ok: true });
      } catch (err) {
        console.error("waiter:status-update error:", err);
        ack({ ok: false });
      }
    });

    /* ================= CASHIER REAL-TIME EVENTS ================= */

    /**
     * Notify managers when bill is paid
     */
    socket.on(
      "cashier:bill-paid",
      ({ billId, billTotal, paymentMethod }, ack) => {
        try {
          if (user.role !== "CASHIER") return ack({ ok: false });

          // Broadcast to managers and waiters
          io.to(`restaurant:${user.restaurantId}:managers`).emit(
            "cashier:payment-processed",
            {
              billId,
              billTotal,
              paymentMethod,
              cashierName: user.name,
              timestamp: new Date(),
            },
          );

          io.to(`restaurant:${user.restaurantId}:waiters`).emit(
            "cashier:bill-settled",
            {
              billId,
              timestamp: new Date(),
            },
          );

          ack({ ok: true });
        } catch (err) {
          console.error("cashier:bill-paid error:", err);
          ack({ ok: false });
        }
      },
    );

    /* ================= MANAGER REAL-TIME EVENTS ================= */

    /**
     * Manager broadcasts live metrics update
     */
    socket.on("manager:metrics-update", ({ metrics }, ack) => {
      try {
        if (!["MANAGER", "BRAND_ADMIN"].includes(user.role))
          return ack({ ok: false });

        // Broadcast to all managers
        io.to(`restaurant:${user.restaurantId}:managers`).emit(
          "dashboard:metrics-updated",
          {
            ...metrics,
            timestamp: new Date(),
          },
        );

        ack({ ok: true });
      } catch (err) {
        console.error("manager:metrics-update error:", err);
        ack({ ok: false });
      }
    });

    /**
     * Manager broadcasts order update
     */
    socket.on("manager:order-update", ({ orderId, status }, ack) => {
      try {
        if (!["MANAGER", "BRAND_ADMIN"].includes(user.role))
          return ack({ ok: false });

        // Broadcast to all staff
        io.to(`restaurant:${user.restaurantId}`).emit(
          "manager:order-status-changed",
          {
            orderId,
            status,
            timestamp: new Date(),
          },
        );

        ack({ ok: true });
      } catch (err) {
        console.error("manager:order-update error:", err);
        ack({ ok: false });
      }
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      console.log(`❌ ${socket.id} disconnected`);

      // Broadcast staff going offline
      if (["CHEF", "WAITER", "CASHIER"].includes(user.role)) {
        io.to(`restaurant:${user.restaurantId}`).emit("staff:went-offline", {
          staffId: user.id,
          role: user.role,
          timestamp: new Date(),
        });
      }
    });
  });

  return io;
}
