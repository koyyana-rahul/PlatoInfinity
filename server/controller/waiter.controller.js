import Order from "../models/order.model.js";
import {
  emitOrderItemStatusUpdate,
  emitOrderServed,
} from "../socket/emitter.js";

console.log(
  "✅ Waiter controller loaded; emitOrderItemStatusUpdate imported:",
  emitOrderItemStatusUpdate,
);

function deriveLiveOrderStatusFromItems(items = []) {
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;

  const newCount = safeItems.filter((i) => i.itemStatus === "NEW").length;
  const inProgressCount = safeItems.filter(
    (i) => i.itemStatus === "IN_PROGRESS",
  ).length;
  const readyCount = safeItems.filter((i) => i.itemStatus === "READY").length;
  const servingCount = safeItems.filter(
    (i) => i.itemStatus === "SERVING",
  ).length;
  const servedCount = safeItems.filter((i) => i.itemStatus === "SERVED").length;

  let orderStatus = "NEW";
  if (totalItems > 0 && servedCount === totalItems) orderStatus = "SERVED";
  else if (servingCount > 0 || servedCount > 0) orderStatus = "SERVING";
  else if (readyCount > 0) orderStatus = "READY";
  else if (inProgressCount > 0) orderStatus = "IN_PROGRESS";

  return {
    orderStatus,
    totalItems,
    newCount,
    inProgressCount,
    readyCount,
    servingCount,
    servedCount,
  };
}

/* ======================================================
   GET WAITER ORDERS (All orders in restaurant)
====================================================== */
export async function getWaiterOrdersController(req, res) {
  try {
    const waiterId = req.user._id;
    const restaurantId = req.user.restaurantId;

    // Get all open orders for the restaurant
    const orders = await Order.find({
      restaurantId,
      orderStatus: "OPEN",
    })
      .select("_id tableId tableName createdAt orderStatus items")
      .lean();

    // For each order, count ready and served items
    const ordersWithStatus = orders.map((order) => {
      const items = order.items || [];
      const readyItems = items.filter((i) => i.itemStatus === "READY").length;
      const servedItems = items.filter((i) => i.itemStatus === "SERVED").length;
      const totalItems = items.length;

      return {
        ...order,
        readyItemsCount: readyItems,
        servedItemsCount: servedItems,
        totalItemsCount: totalItems,
        allServed: readyItems + servedItems === totalItems && totalItems > 0,
      };
    });

    return res.json({
      success: true,
      data: ordersWithStatus,
    });
  } catch (err) {
    console.error("getWaiterOrdersController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ======================================================
   GET READY ITEMS (Items ready to serve by waiter)
====================================================== */
export async function getReadyItemsController(req, res) {
  try {
    const restaurantId = req.user.restaurantId;

    const orders = await Order.aggregate([
      {
        $match: {
          restaurantId,
          orderStatus: "OPEN",
        },
      },
      {
        $project: {
          tableId: 1,
          tableName: 1,
          createdAt: 1,
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.itemStatus", "READY"] },
            },
          },
        },
      },
      { $match: { "items.0": { $exists: true } } },
      { $sort: { createdAt: 1 } },
    ]);

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error("getReadyItemsController:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * WAITER SERVES ITEM (WITH PIN CONFIRMATION)
 * POST /api/waiter/order/:orderId/item/:itemId/serve
 */
export async function serveOrderItemController(req, res) {
  try {
    const { orderId, itemId } = req.params;
    const { staffPin } = req.body;
    const waiterId = req.user._id;
    const restaurantId = req.user.restaurantId;

    console.log(
      `🍽️ Serve request for order ${orderId}, item ${itemId} by waiter ${waiterId}`,
    );

    // 🔐 PIN VERIFICATION (optional)
    // If staffPin is provided, validate it; otherwise allow confirmation-only
    if (staffPin !== null && staffPin !== undefined) {
      const userWaiterPin = req.user.staffPin;
      if (String(staffPin) !== String(userWaiterPin)) {
        return res.status(401).json({
          success: false,
          message: "Invalid Staff PIN",
          error: "INVALID_PIN",
        });
      }
    }

    // 🔍 Find order
    const order = await Order.findOne({
      _id: orderId,
      restaurantId,
      orderStatus: "OPEN",
      "items._id": itemId,
    });

    if (!order) {
      console.error(`❌ Order not found: ${orderId}, item: ${itemId}`);
      return res.status(404).json({
        success: false,
        message: "Order or item not found",
      });
    }

    const item = order.items.id(itemId);

    if (!item) {
      console.error(`❌ Item not found in order: ${itemId}`);
      return res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
    }

    // ❌ Only READY items can be served
    if (item.itemStatus !== "READY") {
      console.warn(`⚠️ Item ${itemId} is ${item.itemStatus}, not READY`);
      return res.status(400).json({
        success: false,
        message: "Item is not READY to be served",
        currentStatus: item.itemStatus,
      });
    }

    // ✅ Step 1: Mark SERVING (so UI shows "serve started")
    item.itemStatus = "SERVING";
    item.waiterId = waiterId;
    item.servedAt = null; // Will be set when completed
    await order.save();

    console.log(`✅ Item ${itemId} marked as SERVING`);

    const servingSnapshot = deriveLiveOrderStatusFromItems(order.items);

    // Emit SERVING status (wrapped in try-catch to prevent crashes)
    try {
      await emitOrderItemStatusUpdate({
        orderId: String(order._id),
        restaurantId: String(order.restaurantId),
        sessionId: String(order.sessionId),
        tableId: String(order.tableId),
        tableName: order.tableName || "Unknown",
        itemId: String(itemId),
        itemIndex: order.items.findIndex((it) => it._id.toString() === itemId),
        itemName: item.name,
        itemStatus: "SERVING",
        chefId: null,
        chefName: null,
        waiterId: String(waiterId),
        waiterName: req.user.name || "Waiter",
        orderStatus: servingSnapshot.orderStatus,
        totalItems: servingSnapshot.totalItems,
        readyCount: servingSnapshot.readyCount,
        servedCount: servingSnapshot.servedCount,
        servingCount: servingSnapshot.servingCount,
        inProgressCount: servingSnapshot.inProgressCount,
        newCount: servingSnapshot.newCount,
        updatedAt: new Date(),
      });
    } catch (emitErr) {
      console.error("⚠️ Failed to emit SERVING status:", emitErr.message);
    }

    // ✅ Step 2: Mark SERVED (completion) after a brief delay to show transition
    await new Promise((resolve) => setTimeout(resolve, 800)); // 0.8s delay
    item.itemStatus = "SERVED";
    item.servedAt = new Date();
    await order.save();

    console.log(`✅ Item ${itemId} marked as SERVED`);

    const servedSnapshot = deriveLiveOrderStatusFromItems(order.items);

    // Emit SERVED update (wrapped in try-catch to prevent crashes)
    try {
      await emitOrderItemStatusUpdate({
        orderId: String(order._id),
        restaurantId: String(order.restaurantId),
        sessionId: String(order.sessionId),
        tableId: String(order.tableId),
        tableName: order.tableName || "Unknown",
        itemId: String(itemId),
        itemIndex: order.items.findIndex((it) => it._id.toString() === itemId),
        itemName: item.name,
        itemStatus: "SERVED",
        chefId: null,
        chefName: null,
        waiterId: String(waiterId),
        waiterName: req.user.name || "Waiter",
        orderStatus: servedSnapshot.orderStatus,
        totalItems: servedSnapshot.totalItems,
        readyCount: servedSnapshot.readyCount,
        servedCount: servedSnapshot.servedCount,
        servingCount: servedSnapshot.servingCount,
        inProgressCount: servedSnapshot.inProgressCount,
        newCount: servedSnapshot.newCount,
        updatedAt: new Date(),
      });
    } catch (emitErr) {
      console.error("⚠️ Failed to emit SERVED status:", emitErr.message);
    }

    if (servedSnapshot.orderStatus === "SERVED") {
      await emitOrderServed({
        orderId: String(order._id),
        restaurantId: String(order.restaurantId),
        sessionId: String(order.sessionId),
        tableId: String(order.tableId),
        tableName: order.tableName || "Unknown",
        orderNumber: order.orderNumber,
        servedBy: String(waiterId),
        servedAt: new Date(),
      });
    }

    return res.json({
      success: true,
      message: "Item served",
      data: item,
    });
  } catch (err) {
    console.error("❌ serveOrderItemController ERROR:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Server error",
    });
  }
}
