/**
 * PHASE 4: SOCKET.IO REAL-TIME HANDLERS
 * Real-time event handlers for live updates
 */

export const registerSocketHandlers = (io) => {
  // ✅ Connection event
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room by restaurantId
    socket.on("join_restaurant", (restaurantId) => {
      socket.join(`restaurant:${restaurantId}`);
      console.log(`Socket ${socket.id} joined restaurant:${restaurantId}`);
    });

    // Join room by userId
    socket.on("join_user", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user:${userId}`);
    });

    /**
     * ✅ ORDER EVENTS
     */

    // Order created event
    socket.on("order:create", (data) => {
      const { restaurantId, orderId, order } = data;
      io.to(`restaurant:${restaurantId}`).emit("order:created", {
        orderId,
        order,
        timestamp: new Date(),
      });
      console.log(`Order created: ${orderId}`);
    });

    // Order status updated
    socket.on("order:update_status", (data) => {
      const { restaurantId, orderId, status } = data;
      io.to(`restaurant:${restaurantId}`).emit("order:status_changed", {
        orderId,
        status,
        timestamp: new Date(),
      });
      console.log(`Order ${orderId} status: ${status}`);
    });

    // Item status updated
    socket.on("order:update_item_status", (data) => {
      const { restaurantId, orderId, itemId, status } = data;
      io.to(`restaurant:${restaurantId}`).emit("order:item_status_changed", {
        orderId,
        itemId,
        status,
        timestamp: new Date(),
      });
      console.log(`Item ${itemId} in order ${orderId} status: ${status}`);
    });

    // Order cancelled
    socket.on("order:cancel", (data) => {
      const { restaurantId, orderId, reason } = data;
      io.to(`restaurant:${restaurantId}`).emit("order:cancelled", {
        orderId,
        reason,
        timestamp: new Date(),
      });
      console.log(`Order ${orderId} cancelled`);
    });

    /**
     * ✅ TABLE EVENTS
     */

    // Table status changed
    socket.on("table:update_status", (data) => {
      const { restaurantId, tableId, status } = data;
      io.to(`restaurant:${restaurantId}`).emit("table:status_changed", {
        tableId,
        status,
        timestamp: new Date(),
      });
      console.log(`Table ${tableId} status: ${status}`);
    });

    // Table assigned to waiter
    socket.on("table:assign_waiter", (data) => {
      const { restaurantId, tableId, waiterId, waiterName } = data;
      io.to(`restaurant:${restaurantId}`).emit("table:waiter_assigned", {
        tableId,
        waiterId,
        waiterName,
        timestamp: new Date(),
      });
      console.log(`Table ${tableId} assigned to waiter ${waiterId}`);
    });

    // Call waiter alert
    socket.on("table:call_waiter", (data) => {
      const { restaurantId, tableId, reason } = data;
      io.to(`restaurant:${restaurantId}`).emit("table:waiter_called", {
        tableId,
        reason,
        timestamp: new Date(),
      });
      console.log(`Waiter called to table ${tableId}`);
    });

    /**
     * ✅ PAYMENT EVENTS
     */

    // Payment received
    socket.on("payment:received", (data) => {
      const { restaurantId, billId, amount, method } = data;
      io.to(`restaurant:${restaurantId}`).emit("payment:completed", {
        billId,
        amount,
        method,
        timestamp: new Date(),
      });
      console.log(`Payment received: ${amount} via ${method}`);
    });

    // Bill created
    socket.on("bill:create", (data) => {
      const { restaurantId, billId, tableId, total } = data;
      io.to(`restaurant:${restaurantId}`).emit("bill:created", {
        billId,
        tableId,
        total,
        timestamp: new Date(),
      });
      console.log(`Bill created: ${billId}`);
    });

    // Bill status changed
    socket.on("bill:update_status", (data) => {
      const { restaurantId, billId, status } = data;
      io.to(`restaurant:${restaurantId}`).emit("bill:status_changed", {
        billId,
        status,
        timestamp: new Date(),
      });
      console.log(`Bill ${billId} status: ${status}`);
    });

    /**
     * ✅ KITCHEN EVENTS
     */

    // Kitchen item ready notification
    socket.on("kitchen:item_ready", (data) => {
      const { restaurantId, orderId, items } = data;
      io.to(`restaurant:${restaurantId}`).emit("kitchen:items_ready", {
        orderId,
        items,
        timestamp: new Date(),
      });
      console.log(`Items ready for order ${orderId}`);
    });

    // Kitchen alert
    socket.on("kitchen:alert", (data) => {
      const { restaurantId, message, priority } = data;
      io.to(`restaurant:${restaurantId}`).emit("kitchen:alert_notification", {
        message,
        priority,
        timestamp: new Date(),
      });
      console.log(`Kitchen alert: ${message}`);
    });

    /**
     * ✅ NOTIFICATION EVENTS
     */

    // Send notification to user
    socket.on("notification:send", (data) => {
      const { userId, message, type } = data;
      io.to(`user:${userId}`).emit("notification:received", {
        message,
        type,
        timestamp: new Date(),
      });
      console.log(`Notification sent to user ${userId}`);
    });

    // Send notification to restaurant
    socket.on("notification:broadcast", (data) => {
      const { restaurantId, message, type } = data;
      io.to(`restaurant:${restaurantId}`).emit("notification:broadcast", {
        message,
        type,
        timestamp: new Date(),
      });
      console.log(`Broadcast notification in restaurant ${restaurantId}`);
    });

    /**
     * ✅ MENU & INVENTORY EVENTS
     */

    // Menu item availability changed
    socket.on("menu:item_availability", (data) => {
      const { restaurantId, itemId, available } = data;
      io.to(`restaurant:${restaurantId}`).emit("menu:availability_changed", {
        itemId,
        available,
        timestamp: new Date(),
      });
      console.log(`Menu item ${itemId} availability: ${available}`);
    });

    // Stock update
    socket.on("inventory:stock_update", (data) => {
      const { restaurantId, itemId, quantity } = data;
      io.to(`restaurant:${restaurantId}`).emit("inventory:stock_changed", {
        itemId,
        quantity,
        timestamp: new Date(),
      });
    });

    /**
     * ✅ DASHBOARD EVENTS
     */

    // Live stats update
    socket.on("dashboard:stats_update", (data) => {
      const { restaurantId, stats } = data;
      io.to(`restaurant:${restaurantId}`).emit("dashboard:stats_updated", {
        stats,
        timestamp: new Date(),
      });
    });

    // Analytics data update
    socket.on("dashboard:analytics_update", (data) => {
      const { restaurantId, analytics } = data;
      io.to(`restaurant:${restaurantId}`).emit("dashboard:analytics_updated", {
        analytics,
        timestamp: new Date(),
      });
    });

    /**
     * ✅ STAFF EVENTS
     */

    // Staff member online/offline
    socket.on("staff:status_change", (data) => {
      const { restaurantId, staffId, status } = data;
      io.to(`restaurant:${restaurantId}`).emit("staff:status_changed", {
        staffId,
        status,
        timestamp: new Date(),
      });
    });

    // Staff performance update
    socket.on("staff:performance_update", (data) => {
      const { restaurantId, staffId, metrics } = data;
      io.to(`restaurant:${restaurantId}`).emit("staff:performance_updated", {
        staffId,
        metrics,
        timestamp: new Date(),
      });
    });

    /**
     * ✅ ERROR & DISCONNECT
     */

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error (${socket.id}):`, error);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

/**
 * SOCKET.IO USAGE GUIDE
 * ====================
 *
 * FRONTEND - Listening to events:
 *
 * import io from 'socket.io-client';
 *
 * const socket = io(SOCKET_URL);
 *
 * // Connect
 * socket.emit('join_restaurant', restaurantId);
 *
 * // Listen for order updates
 * socket.on('order:status_changed', (data) => {
 *   console.log('Order status:', data.status);
 * });
 *
 * // Listen for payment updates
 * socket.on('payment:completed', (data) => {
 *   console.log('Payment received:', data.amount);
 * });
 *
 * // Listen for table updates
 * socket.on('table:status_changed', (data) => {
 *   console.log('Table status:', data.status);
 * });
 *
 *
 * BACKEND - Emitting events:
 *
 * In your controller or route:
 *
 * // Get io instance from request
 * const io = req.app.get('io');
 *
 * // Emit to specific restaurant
 * io.to(`restaurant:${restaurantId}`).emit('order:created', {
 *   orderId,
 *   order,
 *   timestamp: new Date()
 * });
 *
 *
 * EVENT CATEGORIES:
 * - order:* → Order-related events
 * - table:* → Table management events
 * - payment:* → Payment events
 * - kitchen:* → Kitchen events
 * - notification:* → System notifications
 * - menu:* → Menu & inventory
 * - dashboard:* → Live dashboard updates
 * - staff:* → Staff management
 *
 *
 * ROOM STRUCTURE:
 * - restaurant:{restaurantId} → All users in a restaurant
 * - user:{userId} → Specific user
 * - kitchen:{restaurantId} → Kitchen staff only
 * - waiter:{restaurantId} → Waiters only
 * - cashier:{restaurantId} → Cashiers only
 */

export default {
  registerSocketHandlers,
};
