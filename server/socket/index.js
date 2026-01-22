import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import StationQueueEvent from "../models/stationQueueEvent.model.js";

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

  /* ================= SOCKET AUTH ================= */
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Token missing"));

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET_ACCESS || process.env.JWT_SECRET,
      );

      const userId = payload.sub || payload._id;
      const user = await UserModel.findById(userId).lean();
      if (!user) return next(new Error("User not found"));

      socket.user = {
        id: String(user._id),
        role: user.role,
        restaurantId: String(user.restaurantId),
        station: user.kitchenStation || null,
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

    /* ---------- BASE ROOM ---------- */
    socket.join(`restaurant:${user.restaurantId}`);

    /* ---------- WAITER ROOM ---------- */
    if (user.role === "WAITER" || user.role === "MANAGER") {
      socket.join(`restaurant:${user.restaurantId}:waiters`);
    }

    /* ---------- CHEF ROOM ---------- */
    if (user.role === "CHEF" && user.station) {
      socket.join(`restaurant:${user.restaurantId}:station:${user.station}`);
    }

    /* ---------- OPTIONAL EXPLICIT JOIN (frontend) ---------- */
    socket.on("join:waiter", ({ restaurantId }) => {
      if (restaurantId === user.restaurantId) {
        socket.join(`restaurant:${restaurantId}:waiters`);
      }
    });

    /* ================= CHEF EVENTS ================= */

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
      } catch {
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
      } catch {
        ack({ ok: false });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ ${socket.id} disconnected`);
    });
  });

  return io;
}
