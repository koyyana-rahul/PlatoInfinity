import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import StationQueueEvent from "../models/stationQueueEvent.model.js";

let io;

/**
 * ================================
 * INIT SOCKET SERVER
 * ================================
 */
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
   * ================================
   * SOCKET AUTH (JWT)
   * ================================
   */
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET_ACCESS || process.env.JWT_SECRET
      );

      const userId = payload.sub || payload._id || payload.id;
      if (!userId) return next(new Error("Invalid token payload"));

      const user = await UserModel.findById(userId).lean();
      if (!user) return next(new Error("User not found"));

      socket.user = {
        id: String(user._id),
        role: user.role,
        restaurantId: String(user.restaurantId),
        station: user.kitchenStation || null, // ex: "TANDOOR"
      };

      return next();
    } catch (err) {
      console.error("Socket auth error:", err.message);
      return next(new Error("Unauthorized"));
    }
  });

  /**
   * ================================
   * CONNECTION
   * ================================
   */
  io.on("connection", (socket) => {
    const user = socket.user;

    console.log(
      `🔌 Socket connected ${socket.id} | role=${user.role} | restaurant=${user.restaurantId}`
    );

    /**
     * JOIN ROOMS
     * ----------------
     * restaurant:<id>
     * restaurant:<id>:station:<station>
     * restaurant:<id>:waiters
     */
    socket.join(`restaurant:${user.restaurantId}`);

    if (user.role === "WAITER") {
      socket.join(`restaurant:${user.restaurantId}:waiters`);
    }

    if (user.role === "CHEF" && user.station) {
      socket.join(`restaurant:${user.restaurantId}:station:${user.station}`);
    }

    /**
     * ================================
     * CHEF: CLAIM EVENT
     * ================================
     */
    socket.on("station:event:claim", async ({ eventId }, ack) => {
      try {
        const event = await StationQueueEvent.findById(eventId);
        if (!event) return ack({ ok: false, error: "Event not found" });

        if (String(event.restaurantId) !== user.restaurantId)
          return ack({ ok: false, error: "Forbidden" });

        event.status = "PREPARING";
        event.claimedBy = user.id;
        event.claimedAt = new Date();
        await event.save();

        io.to(`restaurant:${user.restaurantId}`).emit("station:event:updated", {
          eventId,
          status: "PREPARING",
          claimedBy: user.id,
        });

        ack({ ok: true });
      } catch (err) {
        console.error("claim error:", err);
        ack({ ok: false, error: "Server error" });
      }
    });

    /**
     * ================================
     * CHEF: UPDATE STATUS
     * ================================
     */
    socket.on("station:event:update", async ({ eventId, status }, ack) => {
      try {
        const allowed = ["READY", "SERVED", "CANCELLED"];
        if (!allowed.includes(status))
          return ack({ ok: false, error: "Invalid status" });

        const event = await StationQueueEvent.findById(eventId);
        if (!event) return ack({ ok: false, error: "Event not found" });

        if (String(event.restaurantId) !== user.restaurantId)
          return ack({ ok: false, error: "Forbidden" });

        event.status = status;
        if (status === "READY") event.readyAt = new Date();
        if (status === "SERVED") event.servedAt = new Date();
        await event.save();

        io.to(`restaurant:${user.restaurantId}`).emit("station:event:updated", {
          eventId,
          status,
          orderId: event.orderId,
          tableId: event.tableId,
        });

        ack({ ok: true });
      } catch (err) {
        console.error("update error:", err);
        ack({ ok: false, error: "Server error" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected ${socket.id}`);
    });
  });

  return io;
}

/**
 * ================================
 * SERVER → KITCHEN EMITTER
 * ================================
 */
export function emitToStation({ restaurantId, station, payload }) {
  if (!io) return;

  io.to(`restaurant:${restaurantId}:station:${station}`).emit(
    "station:event:new",
    payload
  );

  // also notify waiters
  io.to(`restaurant:${restaurantId}:waiters`).emit(
    "station:event:new",
    payload
  );
}
