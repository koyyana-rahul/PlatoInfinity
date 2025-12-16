// src/socket/emitter.js
let _emitFunc = null;
export function registerEmitFunc(fn) {
  _emitFunc = fn;
}
export function getEmitFunc() {
  return _emitFunc;
}
export async function emitToStationWrapper(payload) {
  if (!_emitFunc) {
    console.warn(
      "emitToStation called but emitter not registered yet",
      payload && payload.restaurantId
    );
    return;
  }
  try {
    return await _emitFunc(payload);
  } catch (err) {
    console.error("emitToStationWrapper error:", err);
  }
}

export function emitKitchenEvent(io, restaurantId, station, event, payload) {
  io.to(`restaurant:${restaurantId}:station:${station}`).emit(event, payload);
}
