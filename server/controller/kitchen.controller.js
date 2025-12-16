import Order from "../models/order.model.js";
import { emitKitchenEvent } from "../socket/emitter.js";

/**
 * GET /api/kitchen/orders?station=TANDOOR
 */
export async function listKitchenOrders(req, res) {
  const { station } = req.query;
  const restaurantId = req.user.restaurantId;

  if (!station) return res.status(400).json({ message: "station required" });

  const orders = await Order.find({
    restaurantId,
    orderStatus: "OPEN",
    "items.station": station,
    "items.status": { $ne: "SERVED" },
  })
    .sort({ createdAt: 1 })
    .lean();

  return res.json({ success: true, data: orders });
}

/**
 * POST /api/kitchen/order/:orderId/item/:itemId/status
 * Body: { status }
 */
export async function updateKitchenItemStatus(req, res) {
  const { orderId, itemId } = req.params;
  const { status } = req.body;

  if (!["PREPARING", "READY", "SERVED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const update = {
    "items.$.status": status,
  };

  if (status === "PREPARING") update["items.$.preparedAt"] = new Date();
  if (status === "READY") update["items.$.readyAt"] = new Date();
  if (status === "SERVED") update["items.$.servedAt"] = new Date();

  update["items.$.chefId"] = req.user._id;

  const order = await Order.findOneAndUpdate(
    { _id: orderId, "items._id": itemId },
    { $set: update },
    { new: true }
  );

  if (!order) return res.status(404).json({ message: "Order item not found" });

  // 🔥 SOCKET EVENT
  emitKitchenEvent(
    req.app.get("io"),
    order.restaurantId,
    order.items.find((i) => i._id == itemId).station,
    "order:item:update",
    { orderId, itemId, status }
  );

  return res.json({ success: true });
}
