/**
 * ======================================================
 * SOCKET.IO EVENT EMITTER
 * ======================================================
 * Centralized function to emit events to all relevant roles
 * This ensures consistent real-time updates across the system
 */

let ioRef = null;

export function registerSocket(io) {
  ioRef = io;
}

export function getIO() {
  return ioRef;
}

/* ================= WAITER UPDATES ================= */

export function emitTableUpdate(restaurantId) {
  if (!ioRef) return;
  ioRef.to(`restaurant:${restaurantId}:waiters`).emit("table:update");
}

export function emitSessionUpdate(restaurantId) {
  if (!ioRef) return;
  ioRef.to(`restaurant:${restaurantId}:waiters`).emit("session:update");
}

/* ================= MENU UPDATES ================= */

/**
 * Emit menu update to all customers viewing menu
 * Called when admin updates master menu or manager imports to branch
 */
export function emitMenuUpdate(restaurantId, data = {}) {
  if (!ioRef) return;
  console.log(`📢 Menu update broadcast for restaurant:${restaurantId}`);
  ioRef.to(`restaurant:${restaurantId}:customers`).emit("menu:update", {
    timestamp: new Date(),
    ...data,
  });
}

/**
 * Emit menu item change (individual item update)
 */
export function emitMenuItemUpdate(
  restaurantId,
  menuItemId,
  action = "updated",
) {
  if (!ioRef) return;
  console.log(
    `📢 Menu item ${action}: ${menuItemId} for restaurant:${restaurantId}`,
  );
  ioRef.to(`restaurant:${restaurantId}:customers`).emit("menu:item:change", {
    menuItemId,
    action,
    timestamp: new Date(),
  });
}

/* ================= KITCHEN ================= */

export function emitKitchenEvent(io, restaurantId, station, event, payload) {
  io.to(`restaurant:${restaurantId}:station:${station}`).emit(event, payload);
}

/**
 * ==============================================
 * ORDER PLACED EVENT - Notifies all roles
 * ==============================================
 * Admin, Manager, Waiter: Full order details
 * Customer: Order confirmation
 * Kitchen/Chef: Kitchen items for their station
 */
export async function emitOrderPlaced(orderData) {
  if (!ioRef) {
    console.warn("⚠️ Socket IO not initialized in emitter");
    return;
  }

  const {
    orderId,
    restaurantId,
    sessionId,
    tableId,
    tableName,
    orderNumber,
    items = [],
    totalAmount,
    placedBy,
    placedAt,
  } = orderData;

  console.log(`📢 ORDER PLACED - Order #${orderNumber} at Table ${tableName}`);

  /**
   * 1️⃣ BROADCAST TO RESTAURANT STAFF
   * (Admin, Manager, Waiter)
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("order:placed", {
    orderId,
    sessionId,
    tableId,
    tableName,
    orderNumber,
    totalAmount,
    itemCount: items.length,
    placedBy,
    placedAt,
    status: "NEW",
  });

  /**
   * 2️⃣ NOTIFY WAITER TEAM
   */
  ioRef.to(`restaurant:${restaurantId}:waiters`).emit("table:order-placed", {
    orderId,
    tableId,
    tableName,
    orderNumber,
    itemCount: items.length,
    placedAt,
  });

  /**
   * 3️⃣ SEND TO KITCHEN BY STATION
   * Group items by station and send to respective chefs
   */
  const stationGroups = {};
  items.forEach((item) => {
    const station = item.station || "DEFAULT";
    if (!stationGroups[station]) {
      stationGroups[station] = [];
    }
    stationGroups[station].push(item);
  });

  Object.entries(stationGroups).forEach(([station, stationItems]) => {
    ioRef
      .to(`restaurant:${restaurantId}:station:${station}`)
      .emit("kitchen:order-new", {
        orderId,
        tableId,
        tableName,
        orderNumber,
        items: stationItems,
        station,
        totalItems: stationItems.length,
        placedAt,
      });

    console.log(
      `  🍳 Sent to ${station} station: ${stationItems.length} items`,
    );
  });

  /**
   * 4️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("order:confirmed", {
    orderId,
    orderNumber,
    totalAmount,
    itemCount: items.length,
    estimatedTime: "15-20 mins", // Can be dynamic based on item complexity
  });
}

/**
 * ==============================================
 * ORDER ITEM STATUS UPDATE
 * ==============================================
 * When chef updates item status (CLAIMED, IN_PROGRESS, READY)
 */
export async function emitOrderItemStatusUpdate(updateData) {
  if (!ioRef) return;

  const {
    orderId,
    restaurantId,
    sessionId,
    tableId,
    tableName,
    itemIndex,
    itemName,
    itemStatus,
    chefId,
    chefName,
    updatedAt,
  } = updateData;

  console.log(
    `📍 ITEM STATUS UPDATE - ${itemName} → ${itemStatus} (Table: ${tableName})`,
  );

  /**
   * 1️⃣ NOTIFY ALL STAFF IN RESTAURANT
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("order:item-status-updated", {
    orderId,
    itemIndex,
    itemName,
    itemStatus,
    chefName,
    tableId,
    tableName,
    updatedAt,
  });

  /**
   * 2️⃣ NOTIFY WAITER
   */
  ioRef
    .to(`restaurant:${restaurantId}:waiters`)
    .emit("table:item-status-changed", {
      orderId,
      tableId,
      tableName,
      itemName,
      itemStatus,
      updatedAt,
    });

  /**
   * 3️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("order:item-ready", {
    orderId,
    itemName,
    itemStatus,
    message:
      itemStatus === "READY"
        ? `${itemName} is ready!`
        : `${itemName} is ${itemStatus}`,
  });

  /**
   * 4️⃣ KITCHEN ACKNOWLEDGMENT (to claiming chef)
   */
  if (chefId) {
    ioRef.to(`user:${chefId}`).emit("kitchen:item-updated", {
      orderId,
      itemIndex,
      itemName,
      itemStatus,
    });
  }
}

/**
 * ==============================================
 * ORDER READY FOR SERVING (All items ready)
 * ==============================================
 */
export async function emitOrderReady(orderData) {
  if (!ioRef) return;

  const {
    orderId,
    restaurantId,
    sessionId,
    tableId,
    tableName,
    orderNumber,
    readyAt,
  } = orderData;

  console.log(`✅ ORDER READY - Order #${orderNumber} at Table ${tableName}`);

  /**
   * 1️⃣ NOTIFY WAITERS - PRIORITY
   */
  ioRef.to(`restaurant:${restaurantId}:waiters`).emit("table:order-ready", {
    orderId,
    tableId,
    tableName,
    orderNumber,
    message: `Order #${orderNumber} is ready for Table ${tableName}`,
    readyAt,
  });

  /**
   * 2️⃣ NOTIFY ADMIN/MANAGER
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("order:ready-for-serving", {
    orderId,
    tableId,
    tableName,
    orderNumber,
    readyAt,
  });

  /**
   * 3️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("order:ready", {
    orderId,
    orderNumber,
    message: "Your order is ready! Waiter will serve shortly.",
    readyAt,
  });
}

/**
 * ==============================================
 * ORDER SERVED
 * ==============================================
 */
export async function emitOrderServed(orderData) {
  if (!ioRef) return;

  const {
    orderId,
    restaurantId,
    sessionId,
    tableId,
    tableName,
    orderNumber,
    servedBy,
    servedAt,
  } = orderData;

  console.log(`🍽️ ORDER SERVED - Order #${orderNumber} at Table ${tableName}`);

  /**
   * 1️⃣ NOTIFY STAFF
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("order:served", {
    orderId,
    tableId,
    tableName,
    orderNumber,
    servedBy,
    servedAt,
  });

  /**
   * 2️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("order:served", {
    orderId,
    orderNumber,
    message: "Your order has been served. Enjoy!",
    servedAt,
  });
}

/**
 * ==============================================
 * ORDER CANCELLED
 * ==============================================
 */
export async function emitOrderCancelled(orderData) {
  if (!ioRef) return;

  const {
    orderId,
    restaurantId,
    sessionId,
    tableId,
    tableName,
    orderNumber,
    reason,
    cancelledBy,
    cancelledAt,
  } = orderData;

  console.log(`❌ ORDER CANCELLED - Order #${orderNumber} (Reason: ${reason})`);

  /**
   * 1️⃣ NOTIFY ALL RESTAURANT
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("order:cancelled", {
    orderId,
    tableId,
    tableName,
    orderNumber,
    reason,
    cancelledBy,
    cancelledAt,
  });

  /**
   * 2️⃣ NOTIFY KITCHEN (to remove from queue)
   */
  ioRef
    .to(`restaurant:${restaurantId}:kitchen`)
    .emit("kitchen:order-cancelled", {
      orderId,
      orderNumber,
      reason,
    });

  /**
   * 3️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("order:cancelled", {
    orderId,
    orderNumber,
    reason,
    message: `Order #${orderNumber} has been cancelled.`,
  });
}

/**
 * ==============================================
 * KITCHEN QUEUE UPDATE
 * ==============================================
 * Real-time sync of what's in the queue for each station
 */
export async function emitKitchenQueueUpdate(queueData) {
  if (!ioRef) return;

  const { restaurantId, station, queueItems = [] } = queueData;

  console.log(`🔄 KITCHEN QUEUE UPDATE - ${station} station`);

  /**
   * 1️⃣ SEND TO SPECIFIC STATION
   */
  ioRef
    .to(`restaurant:${restaurantId}:station:${station}`)
    .emit("kitchen:queue-updated", {
      station,
      items: queueItems,
      count: queueItems.length,
      updatedAt: new Date(),
    });

  /**
   * 2️⃣ SEND TO MANAGER (for monitoring)
   */
  ioRef
    .to(`restaurant:${restaurantId}:managers`)
    .emit("kitchen:queue-updated", {
      station,
      items: queueItems,
      count: queueItems.length,
    });
}

/**
 * ==============================================
 * CUSTOMER MENU UPDATE
 * ==============================================
 * When items go out of stock or become available
 */
export async function emitMenuItemStatusChange(itemData) {
  if (!ioRef) return;

  const { restaurantId, itemId, itemName, status, stock } = itemData;

  console.log(`🍴 MENU ITEM STATUS - ${itemName}: ${status}`);

  /**
   * 1️⃣ NOTIFY CUSTOMERS
   */
  ioRef.to(`restaurant:${restaurantId}:customers`).emit("menu:item-updated", {
    itemId,
    itemName,
    status,
    stock,
  });

  /**
   * 2️⃣ NOTIFY STAFF
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("menu:item-availability", {
    itemId,
    itemName,
    status,
    stock,
  });
}

/**
 * ==============================================
 * CART UPDATED (Real-time sync)
 * ==============================================
 */
export async function emitCartUpdated(cartData) {
  if (!ioRef) return;

  const { restaurantId, sessionId, totalItems, totalAmount } = cartData;

  /**
   * 1️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("cart:updated", {
    totalItems,
    totalAmount,
    updatedAt: new Date(),
  });
}

/**
 * ==============================================
 * SESSION CLOSED
 * ==============================================
 */
export async function emitSessionClosed(sessionData) {
  if (!ioRef) return;

  const {
    restaurantId,
    sessionId,
    tableId,
    tableName,
    totalOrders,
    totalAmount,
  } = sessionData;

  console.log(`🔐 SESSION CLOSED - Table ${tableName}`);

  /**
   * 1️⃣ NOTIFY STAFF
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("session:closed", {
    tableId,
    tableName,
    totalOrders,
    totalAmount,
  });

  /**
   * 2️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("session:closed", {
    message: "Your session has ended. Thank you for dining!",
  });

  /**
   * 3️⃣ UPDATE TABLE STATUS
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("table:status-changed", {
    tableId,
    tableName,
    status: "AVAILABLE",
  });
}

/**
 * ==============================================
 * KITCHEN CLAIM ITEM
 * ==============================================
 */
export async function emitChefClaimedItem(claimData) {
  if (!ioRef) return;

  const {
    restaurantId,
    orderId,
    itemIndex,
    itemName,
    chefId,
    chefName,
    station,
  } = claimData;

  console.log(`👨‍🍳 CHEF CLAIMED - ${chefName} claimed ${itemName}`);

  /**
   * 1️⃣ NOTIFY KITCHEN
   */
  ioRef
    .to(`restaurant:${restaurantId}:station:${station}`)
    .emit("kitchen:item-claimed", {
      orderId,
      itemIndex,
      itemName,
      chefName,
      claimedAt: new Date(),
    });

  /**
   * 2️⃣ NOTIFY MANAGER
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("kitchen:item-claimed", {
    itemName,
    chefName,
    station,
  });
}

/**
 * ==============================================
 * TABLE STATUS CHANGED
 * ==============================================
 */
export async function emitTableStatusChanged(tableData) {
  if (!ioRef) return;

  const { restaurantId, tableId, tableName, status, occupiedBy, changedAt } =
    tableData;

  console.log(`🪑 TABLE STATUS - Table ${tableName}: ${status}`);

  /**
   * 1️⃣ NOTIFY ALL STAFF
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("table:status-updated", {
    tableId,
    tableName,
    status,
    occupiedBy,
    changedAt,
  });

  /**
   * 2️⃣ NOTIFY WAITERS SPECIFICALLY
   */
  ioRef.to(`restaurant:${restaurantId}:waiters`).emit("table:availability", {
    tableId,
    tableName,
    status,
  });
}

/**
 * ==============================================
 * BILL GENERATED
 * ==============================================
 */
export async function emitBillGenerated(billData) {
  if (!ioRef) return;

  const {
    restaurantId,
    billId,
    sessionId,
    tableId,
    tableName,
    billNumber,
    totalAmount,
    generatedAt,
  } = billData;

  console.log(`💰 BILL GENERATED - Bill #${billNumber} for Table ${tableName}`);

  /**
   * 1️⃣ NOTIFY CASHIER
   */
  ioRef
    .to(`restaurant:${restaurantId}:cashier`)
    .emit("bill:ready-for-payment", {
      billId,
      billNumber,
      tableId,
      tableName,
      totalAmount,
      generatedAt,
    });

  /**
   * 2️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("bill:generated", {
    billId,
    billNumber,
    totalAmount,
    message: "Your bill is ready. Please proceed to payment counter.",
  });

  /**
   * 3️⃣ NOTIFY MANAGER
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("bill:generated", {
    billId,
    billNumber,
    tableId,
    tableName,
    totalAmount,
  });
}

/**
 * ==============================================
 * PAYMENT RECEIVED
 * ==============================================
 */
export async function emitPaymentReceived(paymentData) {
  if (!ioRef) return;

  const {
    restaurantId,
    billId,
    sessionId,
    tableId,
    tableName,
    billNumber,
    paymentMethod,
    amountReceived,
    paidAt,
  } = paymentData;

  console.log(`✅ PAYMENT RECEIVED - Bill #${billNumber} (${paymentMethod})`);

  /**
   * 1️⃣ NOTIFY CASHIER
   */
  ioRef.to(`restaurant:${restaurantId}:cashier`).emit("bill:paid", {
    billId,
    billNumber,
    tableId,
    tableName,
    paymentMethod,
    amountReceived,
    paidAt,
  });

  /**
   * 2️⃣ NOTIFY CUSTOMER
   */
  ioRef.to(`session:${sessionId}`).emit("payment:confirmed", {
    billNumber,
    amountReceived,
    paymentMethod,
    message: "Payment confirmed. Thank you!",
  });

  /**
   * 3️⃣ NOTIFY STAFF (Update table for reset)
   */
  ioRef.to(`restaurant:${restaurantId}`).emit("payment:completed", {
    tableId,
    tableName,
    billNumber,
    paidAt,
  });
}
