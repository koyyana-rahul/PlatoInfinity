import mongoose from "mongoose";
import Order from "../models/order.model.js";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import Table from "../models/table.model.js";
import CartItem from "../models/cartItem.model.js";
import SessionModel from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js";
import { emitToStation } from "../socket/index.js";

/**
 * ============================
 * PLACE ORDER (FROM CART)
 * ============================
 * POST /api/order/place
 * Auth: requireSessionAuth
 */
export async function placeOrderController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const session = req.sessionDoc;

    /**
     * 1️⃣ SESSION VALIDATION
     */
    if (!session || session.status !== "OPEN") {
      return res.status(400).json({
        message: "Session closed or invalid",
        error: true,
        success: false,
      });
    }

    /**
     * 2️⃣ LOAD CART
     */
    const cartItems = await CartItem.find({
      sessionId: session._id,
    }).session(mongoSession);

    if (!cartItems.length) {
      return res.status(400).json({
        message: "Cart is empty",
        error: true,
        success: false,
      });
    }

    let orderItems = [];
    let totalAmount = 0;

    /**
     * 3️⃣ VALIDATE ITEMS + DEDUCT STOCK (ATOMIC)
     */
    for (const cart of cartItems) {
      const menuItem = await BranchMenuItem.findOne({
        _id: cart.branchMenuItemId,
        restaurantId: session.restaurantId,
        status: "ON",
        isArchived: false,
      }).session(mongoSession);

      if (!menuItem) {
        throw new Error(`${cart.name} is unavailable`);
      }

      if (
        menuItem.trackStock &&
        menuItem.stock !== null &&
        menuItem.stock < cart.quantity
      ) {
        throw new Error(`Insufficient stock for ${menuItem.name}`);
      }

      // Deduct stock
      if (menuItem.trackStock && menuItem.stock !== null) {
        menuItem.stock -= cart.quantity;
        await menuItem.save({ session: mongoSession });
      }

      orderItems.push({
        branchMenuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: cart.quantity,
        station: menuItem.station,
        status: "PLACED",
      });

      totalAmount += menuItem.price * cart.quantity;
    }

    /**
     * 4️⃣ ORDER NUMBER (PER SESSION)
     */
    const orderCount = await Order.countDocuments({
      sessionId: session._id,
    }).session(mongoSession);

    /**
     * 5️⃣ CREATE ORDER
     */
    const [order] = await Order.create(
      [
        {
          restaurantId: session.restaurantId,
          sessionId: session._id,
          tableId: session.tableId,
          orderNumber: orderCount + 1,
          items: orderItems,
          totalAmount,
          orderStatus: "OPEN",
          placedBy: req.user ? "WAITER" : "CUSTOMER",
        },
      ],
      { session: mongoSession }
    );

    /**
     * 6️⃣ CLEAR CART
     */
    await CartItem.deleteMany(
      { sessionId: session._id },
      { session: mongoSession }
    );

    /**
     * 7️⃣ UPDATE TABLE STATUS
     */
    await Table.findByIdAndUpdate(
      session.tableId,
      { status: "OCCUPIED" },
      { session: mongoSession }
    );

    /**
     * 8️⃣ AUDIT LOG (NON-BLOCKING)
     */
    try {
      await AuditLog.create(
        [
          {
            actorType: req.user ? "USER" : "CUSTOMER",
            actorId: req.user?._id || null,
            action: "PLACE_ORDER",
            entityType: "Order",
            entityId: String(order._id),
            meta: {
              sessionId: session._id,
              tableId: session.tableId,
              totalAmount,
            },
          },
        ],
        { session: mongoSession }
      );
    } catch (_) {}

    /**
     * 9️⃣ 🔥 EMIT TO KITCHEN (YOUR REQUIRED FORMAT)
     */
    for (const item of order.items) {
      emitToStation(session.restaurantId, item.station, "order:placed", {
        orderId: order._id,
        tableId: session.tableId,
        item,
      });
    }

    /**
     * 🔟 COMMIT
     */
    await mongoSession.commitTransaction();

    return res.status(201).json({
      success: true,
      error: false,
      data: order,
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("placeOrderController:", err);

    return res.status(400).json({
      message: err.message || "Order failed",
      error: true,
      success: false,
    });
  } finally {
    mongoSession.endSession();
  }
}

/**
 * ============================
 * LIST ORDERS FOR SESSION
 * ============================
 * GET /api/order/session/:sessionId
 */
export async function listSessionOrdersController(req, res) {
  const { sessionId } = req.params;

  const orders = await Order.find({ sessionId }).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    error: false,
    data: orders,
  });
}

/**
 * ============================
 * KITCHEN: ORDERS BY STATION
 * ============================
 * GET /api/kitchen/orders?station=TANDOOR
 */
export async function listKitchenOrdersController(req, res) {
  const { station } = req.query;
  const restaurantId = req.user.restaurantId;

  if (!station) {
    return res.status(400).json({
      message: "station required",
      error: true,
      success: false,
    });
  }

  const orders = await Order.find({
    restaurantId,
    orderStatus: "OPEN",
    "items.station": station,
  }).sort({ createdAt: 1 });

  res.json({
    success: true,
    error: false,
    data: orders,
  });
}

/**
 * ============================
 * CHEF UPDATE ITEM STATUS
 * ============================
 * POST /api/kitchen/order/:orderId/item/:itemId/status
 */
/**
 * =========================
 * UPDATE KITCHEN ITEM STATUS
 * =========================
 * POST /api/kitchen/order/:orderId/item/:itemId/status
 */
export async function updateOrderItemStatusController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const chefId = req.user._id;

    const allowed = ["PREPARING", "READY", "SERVED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        error: true,
        success: false,
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      "items._id": itemId,
    }).session(mongoSession);

    if (!order) {
      throw new Error("Order item not found");
    }

    const item = order.items.id(itemId);

    // ❌ Prevent backward transitions
    const flow = ["PLACED", "PREPARING", "READY", "SERVED"];
    if (flow.indexOf(status) <= flow.indexOf(item.status)) {
      throw new Error("Invalid status transition");
    }

    item.status = status;
    item.chefId = chefId;

    const now = new Date();
    if (status === "PREPARING") item.preparingAt = now;
    if (status === "READY") item.readyAt = now;
    if (status === "SERVED") item.servedAt = now;

    await order.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    // 🔥 SOCKET EMIT
    emitToStation({
      restaurantId: order.restaurantId,
      stationName: item.station,
      eventPayload: {
        type: "ORDER_ITEM_STATUS",
        orderId,
        itemId,
        status,
        tableId: order.tableId,
      },
    });

    return res.json({
      success: true,
      error: false,
      message: "Item status updated",
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("updateOrderItemStatusController:", err);
    res.status(400).json({
      message: err.message,
      error: true,
      success: false,
    });
  } finally {
    mongoSession.endSession();
  }
}

/**
 * ============================
 * COMPLETE ORDER (BILLING)
 * ============================
 * POST /api/order/:orderId/complete
 */
export async function completeOrderController(req, res) {
  const { orderId } = req.params;

  await Order.findByIdAndUpdate(orderId, {
    orderStatus: "COMPLETED",
  });

  res.json({
    success: true,
    error: false,
    message: "Order completed",
  });
}
