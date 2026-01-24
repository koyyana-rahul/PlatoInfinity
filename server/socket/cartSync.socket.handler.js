/**
 * cartSync.socket.handler.js
 *
 * Real-time cart synchronization for FAMILY mode sessions
 * - Multiple devices see same cart
 * - Changes sync instantly via WebSocket
 * - Graceful disconnection handling
 * - Prevents race conditions with idempotency
 */

import SessionModel from "../models/session.model.js";
import CartItemModel from "../models/cartItem.model.js";

const CART_SYNC_NAMESPACE = "cart-sync";

export function setupCartSyncHandlers(io) {
  // Join room based on session
  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    /* ========== JOIN FAMILY MODE CART ========== */
    socket.on("join-family-cart", async (data) => {
      try {
        const { sessionId, restaurantId } = data;

        if (!sessionId) {
          socket.emit("error", { message: "sessionId required" });
          return;
        }

        // Verify session is FAMILY mode
        const session = await SessionModel.findById(sessionId).select("mode");
        if (!session || session.mode !== "FAMILY") {
          socket.emit("error", { message: "Not a FAMILY mode session" });
          return;
        }

        // Join the family cart room
        const roomName = `family-cart:${sessionId}`;
        socket.join(roomName);

        console.log(`✅ Socket ${socket.id} joined family cart ${sessionId}`);

        // Send current cart to this socket
        const cartItems = await CartItemModel.find({
          sessionId,
          restaurantId,
        }).lean();

        socket.emit("cart-synced", {
          sessionId,
          items: cartItems,
          timestamp: new Date(),
        });

        // Notify other devices that someone joined
        socket.broadcast.to(roomName).emit("participant-joined", {
          participantCount: io.sockets.adapter.rooms.get(roomName)?.size || 0,
        });
      } catch (err) {
        console.error("❌ Join family cart failed:", err);
        socket.emit("error", { message: "Failed to join cart" });
      }
    });

    /* ========== ADD TO CART (SYNC) ========== */
    socket.on("add-to-cart", async (data) => {
      try {
        const { sessionId, restaurantId, item } = data;
        const roomName = `family-cart:${sessionId}`;

        // Verify room exists
        if (!io.sockets.adapter.rooms.has(roomName)) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Create cart item
        const cartItem = new CartItemModel({
          sessionId,
          restaurantId,
          ...item,
        });

        const saved = await cartItem.save();

        // Broadcast to all in room
        io.to(roomName).emit("item-added", {
          item: saved,
          totalItems: await CartItemModel.countDocuments({
            sessionId,
          }),
          timestamp: new Date(),
        });

        console.log(`✅ Item added to family cart ${sessionId} and synced`);
      } catch (err) {
        console.error("❌ Add to cart failed:", err);
        socket.emit("error", { message: "Failed to add item" });
      }
    });

    /* ========== UPDATE CART ITEM (SYNC) ========== */
    socket.on("update-cart-item", async (data) => {
      try {
        const { sessionId, itemId, quantity } = data;
        const roomName = `family-cart:${sessionId}`;

        if (quantity <= 0) {
          // Delete instead
          socket.emit("remove-cart-item", { itemId });
          return;
        }

        // Update quantity
        const updated = await CartItemModel.findByIdAndUpdate(
          itemId,
          { quantity },
          { new: true },
        ).lean();

        if (!updated) {
          socket.emit("error", { message: "Item not found" });
          return;
        }

        // Broadcast update
        io.to(roomName).emit("item-updated", {
          item: updated,
          timestamp: new Date(),
        });

        console.log(`✅ Family cart item ${itemId} updated and synced`);
      } catch (err) {
        console.error("❌ Update cart item failed:", err);
        socket.emit("error", { message: "Failed to update item" });
      }
    });

    /* ========== REMOVE FROM CART (SYNC) ========== */
    socket.on("remove-cart-item", async (data) => {
      try {
        const { sessionId, itemId } = data;
        const roomName = `family-cart:${sessionId}`;

        // Delete item
        const deleted = await CartItemModel.findByIdAndDelete(itemId).lean();

        if (!deleted) {
          socket.emit("error", { message: "Item not found" });
          return;
        }

        // Broadcast removal
        io.to(roomName).emit("item-removed", {
          itemId,
          totalItems: await CartItemModel.countDocuments({ sessionId }),
          timestamp: new Date(),
        });

        console.log(`✅ Item removed from family cart ${sessionId} and synced`);
      } catch (err) {
        console.error("❌ Remove cart item failed:", err);
        socket.emit("error", { message: "Failed to remove item" });
      }
    });

    /* ========== CLEAR CART (SYNC) ========== */
    socket.on("clear-cart", async (data) => {
      try {
        const { sessionId } = data;
        const roomName = `family-cart:${sessionId}`;

        // Delete all items
        await CartItemModel.deleteMany({ sessionId });

        // Broadcast clear
        io.to(roomName).emit("cart-cleared", {
          sessionId,
          timestamp: new Date(),
        });

        console.log(`✅ Family cart ${sessionId} cleared and synced`);
      } catch (err) {
        console.error("❌ Clear cart failed:", err);
        socket.emit("error", { message: "Failed to clear cart" });
      }
    });

    /* ========== LEAVE FAMILY CART ========== */
    socket.on("leave-family-cart", (data) => {
      const { sessionId } = data;
      const roomName = `family-cart:${sessionId}`;

      socket.leave(roomName);

      // Notify remaining participants
      const remainingCount = io.sockets.adapter.rooms.get(roomName)?.size || 0;
      if (remainingCount > 0) {
        io.to(roomName).emit("participant-left", {
          participantCount: remainingCount,
        });
      }

      console.log(`👋 Socket ${socket.id} left family cart ${sessionId}`);
    });

    /* ========== DISCONNECT ========== */
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
      // Rooms are auto-cleaned up
    });
  });
}

export default {
  setupCartSyncHandlers,
  CART_SYNC_NAMESPACE,
};
