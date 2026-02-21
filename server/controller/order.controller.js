import mongoose from "mongoose";
import Order from "../models/order.model.js";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import Table from "../models/table.model.js";
import CartItem from "../models/cartItem.model.js";
import SessionModel from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js";
import {
  emitOrderPlaced,
  emitOrderItemStatusUpdate,
  emitOrderReady,
  emitOrderServed,
  emitOrderCancelled,
  emitTableStatusChanged,
  emitFraudAlert,
} from "../socket/emitter.js";
import {
  detectOrderFraud,
  logSuspiciousOrder,
} from "../utils/fraudDetection.js";

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
    const { tablePin, mode, customerLabel } = req.body;
    const deviceId = req.deviceId || req.body?.deviceId || null;

    /**
     * 1️⃣ SESSION VALIDATION + PIN CHECK
     */
    if (!session || session.status !== "OPEN") {
      return res.status(400).json({
        message: "Session closed or invalid",
        error: true,
        success: false,
      });
    }

    if (!tablePin) {
      return res.status(400).json({
        message: "tablePin required",
        error: true,
        success: false,
      });
    }

    const pinResult = await session.verifyPin(String(tablePin));
    if (!pinResult.success) {
      return res.status(401).json({
        message: pinResult.message,
        error: true,
        success: false,
        isBlocked: pinResult.isBlocked || false,
        attemptsLeft: pinResult.attemptsLeft || 0,
      });
    }

    /**
     * 2️⃣ LOAD CART
     */
    const orderCount = await Order.countDocuments({
      sessionId: session._id,
    }).session(mongoSession);

    const requestedMode = mode ? String(mode).toUpperCase() : null;
    const effectiveMode =
      orderCount === 0 && requestedMode
        ? requestedMode
        : session.mode || "FAMILY";

    if (effectiveMode === "INDIVIDUAL" && !deviceId) {
      return res.status(400).json({
        message: "deviceId required for individual mode",
        error: true,
        success: false,
      });
    }

    const cartItems = await CartItem.find({
      sessionId: session._id,
      ...(effectiveMode === "INDIVIDUAL" ? { deviceId } : {}),
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
    const hasLargeQty = cartItems.some((item) => item.quantity > 10);

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
        station: menuItem.station || "MAIN",
        itemStatus: "NEW",
        selectedModifiers: cart.meta?.selectedModifiers || [],
        meta: cart.meta || {},
      });

      totalAmount += menuItem.price * cart.quantity;
    }

    /**
     * 4️⃣ FRAUD DETECTION (ML-BASED)
     */
    const fraudResult = await detectOrderFraud(
      {
        items: orderItems,
        totalAmount,
        sessionId: session._id,
        restaurantId: session.restaurantId,
      },
      { _id: session.restaurantId },
    );

    const orderStatus = fraudResult.isFraudulent ? "PENDING_APPROVAL" : "OPEN";

    /**
     * 6️⃣ CLEAR CART
     */
    await CartItem.deleteMany(
      {
        sessionId: session._id,
        ...(effectiveMode === "INDIVIDUAL" ? { deviceId } : {}),
      },
      { session: mongoSession },
    );

    /**
     * 7️⃣ UPDATE TABLE STATUS
     */
    await Table.findByIdAndUpdate(
      session.tableId,
      { status: "OCCUPIED" },
      { session: mongoSession },
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
        { session: mongoSession },
      );
    } catch (_) {}

    /**
     * 9️⃣ 🔥 EMIT REAL-TIME UPDATES TO ALL ROLES
     */
    if (!hasLargeQty) {
      await emitOrderPlaced({
        orderId: order._id,
        restaurantId: session.restaurantId,
        sessionId: session._id,
        tableId: session.tableId,
        tableName: table.name || table.tableNumber,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        placedBy: order.placedBy,
        placedAt: order.createdAt,
      });
    }

    /**
     * 🔟 COMMIT
     */
    await mongoSession.commitTransaction();

    // Emit fraud alert if order is flagged
    if (fraudResult.isFraudulent) {
      await emitFraudAlert({
        restaurantId: session.restaurantId,
        orderId: order._id,
        orderNumber: order.orderNumber,
        tableName: table.name || table.tableNumber,
        totalAmount: order.totalAmount,
        fraudScore: fraudResult.riskScore || 0,
        fraudReasons: fraudResult.reasons,
      });
    } else {
      // Only emit to kitchen if order is approved
      await emitOrderPlaced({
        orderId: order._id,
        restaurantId: session.restaurantId,
        sessionId: session._id,
        tableId: session.tableId,
        tableName: table.name || table.tableNumber,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        placedBy: order.placedBy,
        placedAt: order.createdAt,
      });
    }

    return res.status(201).json({
      success: true,
      error: false,
      data: order,
      autoApproved: !fraudResult.isFraudulent,
      fraudAlerts: fraudResult.isFraudulent ? fraudResult.reasons : [],
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

  // If we have a session from a token, and we are a customer,
  // let's trust the token and ignore the sessionId from the URL.
  if (req.sessionDoc && !req.user) {
    if (req.sessionDoc.mode === "INDIVIDUAL" && !req.deviceId) {
      return res.status(400).json({
        message: "deviceId required for individual mode",
        error: true,
        success: false,
      });
    }

    const orders = await Order.find({
      sessionId: req.sessionDoc._id,
      ...(req.sessionDoc.mode === "INDIVIDUAL"
        ? { "meta.deviceId": req.deviceId }
        : {}),
    })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({
      success: true,
      error: false,
      data: orders,
    });
  }

  // Fallback to old logic for staff or if no token was provided
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({
      message: "Invalid sessionId",
      error: true,
      success: false,
    });
  }

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
    "items.itemStatus": { $ne: "SERVED" },
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

    const normalizedStatus = status === "PREPARING" ? "IN_PROGRESS" : status;

    const allowed = ["IN_PROGRESS", "READY", "SERVED"];
    if (!allowed.includes(normalizedStatus)) {
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
    const flow = ["NEW", "IN_PROGRESS", "READY", "SERVED"];
    const current = item.itemStatus || "NEW";
    if (flow.indexOf(normalizedStatus) <= flow.indexOf(current)) {
      throw new Error("Invalid status transition");
    }

    item.itemStatus = normalizedStatus;
    item.chefId = chefId;

    const now = new Date();
    if (normalizedStatus === "IN_PROGRESS") item.claimedAt = now;
    if (normalizedStatus === "READY") item.readyAt = now;
    if (normalizedStatus === "SERVED") item.servedAt = now;

    await order.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    // 🔥 SOCKET EMIT
    emitKitchenEvent(
      req.app.locals.io,
      order.restaurantId,
      item.station,
      "order:itemStatus",
      {
        type: "ORDER_ITEM_STATUS",
        orderId,
        itemId,
        status: normalizedStatus,
        tableId: order.tableId,
      },
    );

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
    orderStatus: "PAID",
  });

  res.json({
    success: true,
    error: false,
    message: "Order completed",
  });
}

/**
 * ============================
 * GET RECENT ORDERS (ADMIN DASHBOARD)
 * ============================
 * GET /api/order/recent?limit=10&range=today
 * Access: ADMIN / OWNER
 */
export async function recentOrdersController(req, res) {
  try {
    const { limit = 10, range = "today", restaurantId } = req.query;
    const user = req.user;

    // Build filter - use provided restaurantId or user's restaurantId if they're a manager
    let filter = {
      createdAt: { $gte: new Date(), $lte: new Date() },
    };

    // Parse date range
    let startDate = new Date();
    let endDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "week") {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === "month") {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    filter.createdAt = { $gte: startDate, $lte: endDate };

    // If restaurantId is provided, use it. Otherwise use user's restaurantId if they're a manager
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    } else if (user.restaurantId) {
      filter.restaurantId = user.restaurantId;
    }
    // If neither is provided, fetch all orders for the brand (for brand admins)

    const orders = await Order.find(filter)
      .select(
        "orderNumber tableName totalAmount orderStatus createdAt updatedAt items restaurantId",
      )
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    return res.json({
      success: true,
      error: false,
      data: orders,
    });
  } catch (err) {
    console.error("recentOrdersController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * ============================
 * GET ORDER BY ID
 * ============================
 * GET /api/order/:orderId
 * Returns order details with progress metrics
 */
export async function getOrderController(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("restaurantId", "name")
      .populate("sessionId", "tableId tableName")
      .populate("items.menuItemId", "name price category");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Calculate progress metrics
    const totalItems = order.items?.length || 0;
    const readyCount = (order.items || []).filter(
      (i) => i.itemStatus === "READY" || i.itemStatus === "SERVED",
    ).length;
    const servedCount = (order.items || []).filter(
      (i) => i.itemStatus === "SERVED",
    ).length;

    return res.json({
      success: true,
      data: {
        ...order.toObject(),
        progress: {
          totalItems,
          readyCount,
          servedCount,
          percentage: totalItems
            ? Math.round((servedCount / totalItems) * 100)
            : 0,
        },
      },
    });
  } catch (err) {
    console.error("getOrderController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * ============================
 * GET SESSION ORDERS
 * ============================
 * GET /api/order/session/:sessionId
 * Returns all orders for a session with progress
 */
export async function getSessionOrdersController(req, res) {
  try {
    const { sessionId } = req.params;

    const orders = await Order.find({ sessionId })
      .populate("restaurantId", "name")
      .populate("items.menuItemId", "name price")
      .sort({ placedAt: -1 });

    return res.json({
      success: true,
      data: orders.map((order) => {
        const totalItems = order.items?.length || 0;
        const readyCount = (order.items || []).filter(
          (i) => i.itemStatus === "READY" || i.itemStatus === "SERVED",
        ).length;

        return {
          ...order.toObject(),
          progress: {
            totalItems,
            readyCount,
            percentage: totalItems
              ? Math.round((readyCount / totalItems) * 100)
              : 0,
          },
        };
      }),
    });
  } catch (err) {
    console.error("getSessionOrdersController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * ============================
 * APPROVE SUSPICIOUS ORDER
 * ============================
 * PUT /api/order/:orderId/approve
 * Manager approves a fraudulent/suspicious order to proceed
 */
export async function approveOrderController(req, res) {
  try {
    const { orderId } = req.params;
    const manager = req.user;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "PENDING_APPROVAL") {
      return res.status(400).json({
        success: false,
        message: "Order is not pending approval",
      });
    }

    // Update order status and log approval
    order.orderStatus = "OPEN";
    order.meta = order.meta || {};
    order.meta.approvedBy = manager._id;
    order.meta.approvalTime = new Date();

    await order.save();

    // Emit update to kitchen
    emitOrderPlaced(order._id, { ...order.toObject(), status: "OPEN" });

    return res.json({
      success: true,
      message: "Order approved",
      data: order,
    });
  } catch (err) {
    console.error("approveOrderController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * ============================
 * REJECT SUSPICIOUS ORDER
 * ============================
 * PUT /api/order/:orderId/reject
 * Manager rejects a fraudulent/suspicious order
 */
export async function rejectOrderController(req, res) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const manager = req.user;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus !== "PENDING_APPROVAL") {
      return res.status(400).json({
        success: false,
        message: "Order is not pending approval",
      });
    }

    // Update order status and log rejection
    order.orderStatus = "CANCELLED";
    order.meta = order.meta || {};
    order.meta.rejectedBy = manager._id;
    order.meta.rejectionReason = reason || "Manager rejected";
    order.meta.rejectionTime = new Date();

    await order.save();

    // Restore cart items if needed
    await CartItem.deleteMany({
      orderId: order._id,
    });

    return res.json({
      success: true,
      message: "Order rejected",
      data: order,
    });
  } catch (err) {
    console.error("rejectOrderController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
