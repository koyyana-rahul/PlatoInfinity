import Order from "../models/order.model.js";
import { emitKitchenEvent } from "../socket/emitter.js";

/**
 * WAITER SERVES ITEM
 * POST /api/waiter/order/:orderId/item/:itemId/serve
 */
export async function serveOrderItemController(req, res) {
  try {
    const { orderId, itemId } = req.params;
    const waiterId = req.user._id;

    // 🔍 Find order
    const order = await Order.findOne({
      _id: orderId,
      orderStatus: "OPEN",
      "items._id": itemId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order or item not found",
      });
    }

    const item = order.items.id(itemId);

    // ❌ Only READY items can be served
    if (item.itemStatus !== "READY") {
      return res.status(400).json({
        success: false,
        message: "Item is not READY to be served",
      });
    }

    // ✅ Mark SERVED
    item.itemStatus = "SERVED";
    item.waiterId = waiterId;
    item.servedAt = new Date();

    // 🔄 Auto-complete order if all served
    const remaining = order.items.some(
      (i) => i.itemStatus !== "SERVED"
    );

    if (!remaining) {
      order.orderStatus = "COMPLETED";
    }

    await order.save();

    // 🔥 SOCKET EVENTS
    emitKitchenEvent(
      req.app.get("io"),
      order.restaurantId,
      item.station,
      "order:served",
      {
        orderId,
        itemId,
        tableId: order.tableId,
        tableName: order.tableName,
      }
    );

    return res.json({
      success: true,
      message: "Item served",
      data: item,
    });
  } catch (err) {
    console.error("serveOrderItemController:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
