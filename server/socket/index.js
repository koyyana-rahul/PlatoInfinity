import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import StationQueueEvent from "../models/stationQueueEvent.model.js";
import Order from "../models/order.model.js";
import Table from "../models/table.model.js";
import WaiterAlert from "../models/waiterAlert.model.js";
import {
  registerSocket,
  emitStationStatusUpdate,
  emitOrderItemStatusUpdate,
} from "./emitter.js";

let io;

/* =====================================================
   INIT SOCKET SERVER
===================================================== */
export function initSocketServer(httpServer, options = {}) {
  // Determine allowed origins for CORS
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    process.env.CLIENT_URL,
  ].filter(Boolean);

  io = new SocketIOServer(httpServer, {
    path: options.path || "/socket.io",
    cors: {
      origin: (origin, callback) => {
        // In development, allow all localhost origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else if (process.env.NODE_ENV !== "production") {
          // Development: be permissive with localhost variants
          if (origin?.includes("localhost") || origin?.includes("127.0.0.1")) {
            callback(null, true);
          } else {
            callback(new Error("CORS not allowed"));
          }
        } else {
          callback(new Error("CORS not allowed"));
        }
      },
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

      console.log(
        `🔐 Socket auth attempt | uuid=${socket.id} | has_token=${!!token}`,
      );

      // 🔄 TRY JWT FIRST (for staff/admin/manager/chef)
      if (token) {
        try {
          const payload = jwt.verify(
            token,
            process.env.JWT_SECRET_ACCESS || process.env.JWT_SECRET,
          );

          console.log(`✅ JWT verified | payload:`, {
            _id: payload._id,
            role: payload.role,
            restaurantId: payload.restaurantId,
          });

          const userId = payload.sub || payload._id;
          const user = await UserModel.findById(userId).lean();
          if (!user) {
            console.error(`❌ User not found for _id: ${userId}`);
            return next(new Error("User not found"));
          }

          socket.user = {
            id: String(user._id),
            name: user.name,
            role: user.role,
            restaurantId: String(user.restaurantId),
            station: user.kitchenStation || null,
          };

          console.log(`✅ Staff authenticated | socket.user:`, socket.user);
          return next();
        } catch (jwtErr) {
          // JWT verification failed, treat as customer session token
          console.warn(`⚠️ JWT verification failed: ${jwtErr.message}`);
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

      console.log(`✅ Customer session allowed (JWT not required)`);
      next();
    } catch (err) {
      console.error("❌ Socket auth error:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  /* ================= CONNECTION ================= */
  io.on("connection", (socket) => {
    const user = socket.user;

    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔌 SOCKET CONNECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Socket ID: ${socket.id}
  Role: ${user.role}
  User ID: ${user.id}
  Name: ${user.name}
  Restaurant ID: ${user.restaurantId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    // Skip base room for customers (they'll join explicitly)
    if (user.role !== "CUSTOMER" && user.restaurantId) {
      console.log(`✅ Staff member - joining rooms...`);

      /* ---------- BASE ROOM ---------- */
      socket.join(`restaurant:${user.restaurantId}`);
      console.log(`  ✓ Joined: restaurant:${user.restaurantId}`);

      /* ---------- MANAGER ROOM ---------- */
      if (user.role === "MANAGER" || user.role === "BRAND_ADMIN") {
        socket.join(`restaurant:${user.restaurantId}:managers`);
        console.log(`  ✓ Joined: restaurant:${user.restaurantId}:managers`);
      }

      /* ---------- WAITER ROOM ---------- */
      if (user.role === "WAITER" || user.role === "MANAGER") {
        socket.join(`restaurant:${user.restaurantId}:waiters`);
        console.log(`  ✓ Joined: restaurant:${user.restaurantId}:waiters`);
        console.log(
          `  📊 Waiters in room: ${io.sockets.adapter.rooms.get(`restaurant:${user.restaurantId}:waiters`)?.size || 0}`,
        );
      }

      /* ---------- CHEF ROOM ---------- */
      if (user.role === "CHEF" && user.station) {
        socket.join(`restaurant:${user.restaurantId}:station:${user.station}`);
        socket.join(`restaurant:${user.restaurantId}:kitchen`);
        console.log(
          `  ✓ Joined: restaurant:${user.restaurantId}:station:${user.station}`,
        );
        console.log(`  ✓ Joined: restaurant:${user.restaurantId}:kitchen`);
      }

      /* ---------- CASHIER ROOM ---------- */
      if (user.role === "CASHIER") {
        socket.join(`restaurant:${user.restaurantId}:cashier`);
        console.log(`  ✓ Joined: restaurant:${user.restaurantId}:cashier`);
      }

      /* ---------- USER-SPECIFIC ROOM (for direct notifications) ---------- */
      socket.join(`user:${user.id}`);
      console.log(`  ✓ Joined: user:${user.id}`);
    } else if (user.role === "CUSTOMER") {
      console.log(
        `👥 Customer connected (will join specific room on join:customer event)`,
      );
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

    /* ---------- CUSTOMER CALL WAITER ---------- */
    socket.on(
      "table:call_waiter",
      async ({ restaurantId, tableId, tableName, reason }, ack) => {
        try {
          console.log("📞 Received table:call_waiter event", {
            socketId: socket.id,
            restaurantId,
            tableId,
            tableName,
            reason,
          });

          if (!restaurantId || !tableId) {
            console.error("❌ Missing restaurantId or tableId");
            ack?.({ ok: false, error: "Missing restaurant or table" });
            return;
          }

          let resolvedTableName = tableName;

          if (!resolvedTableName) {
            console.log("🔍 Looking up table:", tableId);
            const table = await Table.findById(tableId)
              .select("tableNumber restaurantId")
              .lean();

            if (!table) {
              console.error("❌ Table not found:", tableId);
              ack?.({ ok: false, error: "Table not found" });
              return;
            }

            if (String(table.restaurantId) !== String(restaurantId)) {
              console.error(
                "❌ Table restaurant mismatch:",
                String(table.restaurantId),
                "!==",
                String(restaurantId),
              );
              ack?.({ ok: false, error: "Table restaurant mismatch" });
              return;
            }

            resolvedTableName = table.tableNumber;
            console.log("✅ Table resolved:", resolvedTableName);
          }

          const normalizedReason = String(reason || "").toUpperCase();
          const isBillRequest =
            normalizedReason === "BILL_REQUEST" ||
            normalizedReason.includes("BILL");
          const isTablePinRequest =
            normalizedReason === "TABLE_PIN_REQUEST" ||
            normalizedReason.includes("PIN") ||
            normalizedReason === "ORDER";

          const alertType = isBillRequest
            ? "BILL_REQUEST"
            : isTablePinRequest
              ? "TABLE_PIN"
              : "GENERAL";

          const normalizedAlertReason = isBillRequest
            ? "Customer requested bill"
            : isTablePinRequest
              ? "Customer requested table PIN help"
              : reason || "GENERAL";

          const alertPayload = {
            tableId: String(tableId),
            tableName: resolvedTableName || "Table",
            reason: normalizedAlertReason,
            alertType,
            timestamp: new Date().toISOString(),
          };

          // 💾 SAVE ALERT TO DATABASE
          try {
            const alertDate = new Date();
            const dateSlot = alertDate.toISOString().split("T")[0]; // YYYY-MM-DD
            const hour = String(alertDate.getHours()).padStart(2, "0");
            const timeSlot = `${hour}:00-${String(
              (alertDate.getHours() + 1) % 24,
            ).padStart(2, "0")}:00`;

            const waiterAlert = new WaiterAlert({
              restaurantId,
              tableId,
              tableName: resolvedTableName || "Table",
              reason: normalizedAlertReason || "Call button pressed",
              alertType,
              status: "PENDING",
              dateSlot,
              timeSlot,
              createdBySessionId: null,
            });

            await waiterAlert.save();

            console.log("✅ Alert stored in database:", {
              _id: waiterAlert._id,
              table: resolvedTableName,
              dateSlot,
              timeSlot,
            });

            alertPayload.alertId = waiterAlert._id;
          } catch (dbErr) {
            console.error("⚠️ Failed to save alert to database:", dbErr);
            // Continue with broadcast anyway, don't block on DB save
          }

          const waiterRoom = `restaurant:${restaurantId}:waiters`;
          const waiterCount =
            io.sockets.adapter.rooms.get(waiterRoom)?.size || 0;

          console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📢 BROADCASTING WAITER CALL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Room: ${waiterRoom}
  Waiters connected: ${waiterCount}
  Payload: ${JSON.stringify(alertPayload, null, 2)}
  Events: table:call-bell, table:call_waiter, table:waiter_called
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `);

          io.to(waiterRoom).emit("table:call-bell", alertPayload);
          io.to(waiterRoom).emit("table:call_waiter", alertPayload);
          io.to(waiterRoom).emit("table:waiter_called", alertPayload);

          console.log(`✅ Broadcast sent to ${waiterCount} waiter(s)`);

          ack?.({ ok: true });
        } catch (err) {
          console.error("❌ table:call_waiter error:", err);
          ack?.({ ok: false, error: err.message });
        }
      },
    );

    /* ---------- KITCHEN JOIN (for chefs to listen to kitchen events) ---------- */
    socket.on("join:kitchen", ({ restaurantId }) => {
      if (user.role === "CHEF" && restaurantId) {
        socket.join(`restaurant:${restaurantId}:kitchen`);
        if (user.station) {
          socket.join(`restaurant:${restaurantId}:station:${user.station}`);
        }
        console.log(
          `👨‍🍳 Chef joined kitchen: restaurant:${restaurantId} | station:${user.station}`,
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

        // Emit comprehensive status update
        await emitOrderItemStatusUpdate({
          orderId: String(orderId),
          restaurantId: user.restaurantId,
          sessionId: String(order.sessionId),
          tableId: String(order.tableId),
          tableName: order.tableName,
          itemIndex,
          itemName: item.name,
          itemStatus: "IN_PROGRESS",
          chefId: user.id,
          chefName: user.name,
          updatedAt: new Date(),
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

        // Emit comprehensive status update
        await emitOrderItemStatusUpdate({
          orderId: String(orderId),
          restaurantId: user.restaurantId,
          sessionId: String(order.sessionId),
          tableId: String(order.tableId),
          tableName: order.tableName,
          itemIndex,
          itemName: item.name,
          itemStatus: "READY",
          chefId: user.id,
          chefName: user.name,
          updatedAt: new Date(),
        });

        // If all items ready, notify kitchen
        if (allReady) {
          io.to(`restaurant:${user.restaurantId}`).emit(
            "order:ready-for-serving",
            {
              orderId,
              tableName: order.tableName,
              tableId: order.tableId,
            },
          );
        }

        ack({ ok: true, allReady });
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
        const event = await StationQueueEvent.findById(eventId)
          .populate("orderId", "tableId tableName sessionId")
          .lean();
        if (!event) return ack({ ok: false });

        // Update the event status
        const updateData = { status };
        if (status === "READY") updateData.readyAt = new Date();
        if (status === "SERVED") updateData.servedAt = new Date();

        await StationQueueEvent.findByIdAndUpdate(eventId, updateData);

        // Emit status update to all relevant parties
        await emitStationStatusUpdate({
          restaurantId: String(event.restaurantId),
          stationName: event.stationName,
          eventId: String(eventId),
          orderId: String(event.orderId._id),
          itemName: event.name,
          status,
          tableId: event.orderId?.tableId
            ? String(event.orderId.tableId)
            : null,
          tableName: event.orderId?.tableName || null,
        });

        // Also emit general update
        io.to(`restaurant:${user.restaurantId}`).emit("station:event:updated", {
          eventId,
          status,
          tableId: event.orderId?.tableId,
          orderId: String(event.orderId._id),
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
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔌 SOCKET DISCONNECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Socket ID: ${socket.id}
  Role: ${user.role}
  User Name: ${user.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      // Broadcast staff going offline
      if (["CHEF", "WAITER", "CASHIER"].includes(user.role)) {
        if (user.restaurantId) {
          io.to(`restaurant:${user.restaurantId}`).emit("staff:went-offline", {
            staffId: user.id,
            role: user.role,
            name: user.name,
            timestamp: new Date(),
          });
        }
      }
    });
  });

  return io;
}
