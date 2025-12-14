// src/socket/index.js
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import StationQueueEventModel from "../models/stationQueueEvent.model.js";
import UserModel from "../models/user.model.js";

/**
 * initSocketServer(httpServer, options)
 * - httpServer: Node http.Server returned by app.listen()
 * - options: { path?: string, cors?: {} }
 *
 * Returns socketServer instance and helper `emitToStation`.
 */

export function initSocketServer(httpServer, options = {}) {
  const io = new SocketIOServer(httpServer, {
    path: options.path || "/socket.io",
    cors: options.cors || {
      origin: options.cors?.origin || "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Namespaces: We'll use the default namespace '/' with rooms:
  // - restaurant:<restaurantId>:station:<stationId or stationName>
  // Example room: restaurant:64b9f3...:station:BAR

  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      // Accept either a Bearer token (cookie not available in native sockets) or a query token
      // Clients send token in `auth` on connect: io({ auth: { token } })
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
          socket.handshake.headers.authorization.split(" ")[1]);
      if (!token) {
        // allow unauthenticated read-only connections? Deny by default.
        return next(new Error("Authentication required"));
      }

      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return next(new Error("Invalid token"));
      }

      const userId = payload.sub || payload._id || payload.id;
      if (!userId) return next(new Error("Invalid token payload"));

      const user = await UserModel.findById(userId).lean();
      if (!user) return next(new Error("User not found"));

      // Attach user to socket for later permission checks
      socket.user = {
        id: String(user._id),
        role: user.role,
        restaurantId: String(user.restaurantId),
        name: user.name,
        kitchenStationId: user.kitchenStationId
          ? String(user.kitchenStationId)
          : null,
      };

      return next();
    } catch (err) {
      console.error("socket auth error", err);
      return next(new Error("Server error"));
    }
  });

  io.on("connection", (socket) => {
    const u = socket.user;
    console.log(
      `Socket connected: ${socket.id} user=${u.id} role=${u.role} restaurant=${u.restaurantId}`
    );

    // If staff has a kitchenStationId, auto-join them to their station room(s)
    if (u.kitchenStationId) {
      // Also join by stationId and restaurant-stationName room (useful if stationId null)
      socket.join(`restaurant:${u.restaurantId}:station:${u.kitchenStationId}`);
      // Also join by stationName - not always available here
    }

    // Allow client to join specific station rooms (if user permitted)
    socket.on("joinStation", (data, ack) => {
      try {
        const { stationId, stationName } = data || {};
        if (!socket.user)
          return ack && ack({ ok: false, error: "not authenticated" });
        // Only staff of same restaurant allowed
        // You can add role checks: only CHEF or BAR roles
        if (stationId)
          socket.join(
            `restaurant:${socket.user.restaurantId}:station:${stationId}`
          );
        if (stationName)
          socket.join(
            `restaurant:${socket.user.restaurantId}:stationName:${stationName}`
          );
        return ack && ack({ ok: true });
      } catch (e) {
        return ack && ack({ ok: false, error: e.message });
      }
    });

    // Kitchen tablet can claim an event
    socket.on("claimEvent", async (payload, ack) => {
      // payload: { eventId } -> mark StationQueueEvent status = "CLAIMED", claimedBy = socket.user.id
      try {
        const { eventId } = payload || {};
        if (!eventId)
          return ack && ack({ ok: false, error: "eventId required" });
        const event = await StationQueueEventModel.findById(eventId);
        if (!event) return ack && ack({ ok: false, error: "event not found" });
        // ensure same restaurant
        if (String(event.restaurantId) !== socket.user.restaurantId)
          return ack && ack({ ok: false, error: "forbidden" });

        // Update event (we could check status transitions)
        event.status = "CLAIMED";
        event.claimedBy = socket.user.id;
        event.claimedAt = new Date();
        await event.save();

        // broadcast to room that event claimed
        io.to(
          `restaurant:${event.restaurantId}:station:${
            event.stationId || event.stationName
          }`
        ).emit("eventClaimed", {
          eventId: event._id,
          claimedBy: socket.user.id,
        });

        return ack && ack({ ok: true, eventId: event._id });
      } catch (err) {
        console.error("claimEvent error", err);
        return ack && ack({ ok: false, error: err.message });
      }
    });

    // Kitchen marks item as READY/SERVED
    socket.on("updateEventStatus", async (payload, ack) => {
      // payload: { eventId, status } status ∈ ["PREPARING","READY","SERVED","CANCELLED"]
      try {
        const { eventId, status } = payload || {};
        if (!eventId || !status)
          return (
            ack && ack({ ok: false, error: "eventId and status required" })
          );
        const allowed = ["PREPARING", "READY", "SERVED", "CANCELLED"];
        if (!allowed.includes(status))
          return ack && ack({ ok: false, error: "Invalid status" });

        const event = await StationQueueEventModel.findById(eventId);
        if (!event) return ack && ack({ ok: false, error: "event not found" });
        if (String(event.restaurantId) !== socket.user.restaurantId)
          return ack && ack({ ok: false, error: "forbidden" });

        event.status = status;
        event.updatedAt = new Date();
        if (status === "READY") event.readyAt = new Date();
        if (status === "SERVED") event.servedAt = new Date();
        await event.save();

        // Emit update to rooms: kitchen and waiter/dashboard rooms
        io.to(
          `restaurant:${event.restaurantId}:station:${
            event.stationId || event.stationName
          }`
        ).emit("eventUpdated", { eventId: event._id, status });
        // Notify waiters (they can be in table-specific rooms or restaurant-wide)
        io.to(`restaurant:${event.restaurantId}:waiters`).emit("eventUpdated", {
          eventId: event._id,
          status,
          orderId: event.orderId,
        });

        return ack && ack({ ok: true });
      } catch (err) {
        console.error("updateEventStatus error", err);
        return ack && ack({ ok: false, error: err.message });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} reason=${reason}`);
    });
  });

  /**
   * Helper to emit to a station room.
   * stationIdOrName can be a stationId (ObjectId) or stationName string.
   * eventPayload should include orderId, item details, quantity, eventId (optional).
   */
  async function emitToStation({
    restaurantId,
    stationId = null,
    stationName = null,
    eventPayload,
  }) {
    try {
      const roomById = stationId
        ? `restaurant:${restaurantId}:station:${stationId}`
        : null;
      const roomByName = stationName
        ? `restaurant:${restaurantId}:stationName:${stationName}`
        : null;
      // Emit to both rooms to cover both subscription strategies
      if (roomById) io.to(roomById).emit("newStationEvent", eventPayload);
      if (roomByName) io.to(roomByName).emit("newStationEvent", eventPayload);
      // Also emit to restaurant waiters so UI updates
      io.to(`restaurant:${restaurantId}:waiters`).emit(
        "newStationEvent",
        eventPayload
      );
    } catch (err) {
      console.error("emitToStation error", err);
    }
  }

  return { io, emitToStation };
}
