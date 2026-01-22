let ioRef = null;

export function registerSocket(io) {
  ioRef = io;
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
