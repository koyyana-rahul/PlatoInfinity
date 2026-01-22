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

/* ================= KITCHEN ================= */

export function emitKitchenEvent(io, restaurantId, station, event, payload) {
  io.to(`restaurant:${restaurantId}:station:${station}`).emit(event, payload);
}
