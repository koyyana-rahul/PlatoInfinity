import Order from "../models/order.model.js";
import { emitKitchenEvent } from "../socket/emitter.js";

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
    const waiterPin = req.user.staffPin; // Assuming this is set on user from login

    // 🔐 PIN VERIFICATION
    if (!staffPin) {
      return res.status(400).json({
        success: false,
        message: "Staff PIN required to mark items as served",
      });
    }

    // Simple PIN check
    if (String(staffPin) !== String(waiterPin)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Staff PIN",
        error: "INVALID_PIN",
      });
    }

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
    const remaining = order.items.some((i) => i.itemStatus !== "SERVED");

    if (!remaining) {
      order.meta = {
        ...(order.meta || {}),
        allItemsServedAt: new Date(),
      };
    }

    await order.save();

    // 🔥 SOCKET EVENTS
    emitKitchenEvent(
      req.app.locals.io,
      order.restaurantId,
      item.station,
      "order:served",
      {
        orderId,
        itemId,
        tableId: order.tableId,
        tableName: order.tableName,
        waiterId,
      },
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
