import mongoose from "mongoose";
import Order from "../models/order.model.js";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import Table from "../models/table.model.js";
import CartItem from "../models/cartItem.model.js";
import SessionModel from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js";
import Restaurant from "../models/restaurant.model.js";
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
    const { tablePin, mode, customerLabel, paymentMethod = null } = req.body;
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
        kitchenStationId: menuItem.kitchenStationId || null,
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
     * 5️⃣ CREATE ORDER
     */
    const table = await Table.findById(session.tableId)
      .select("name tableNumber")
      .session(mongoSession);

    if (!table) {
      throw new Error("Table not found for active session");
    }

    const [order] = await Order.create(
      [
        {
          restaurantId: session.restaurantId,
          sessionId: session._id,
          tableId: session.tableId,
          tableName: table.name || table.tableNumber || "Table",
          items: orderItems,
          orderStatus,
          paymentMethod,
          isSuspicious: !!fraudResult.isFraudulent,
          suspiciousReason:
            fraudResult.isFraudulent && fraudResult.reasons?.length
              ? fraudResult.reasons.join(", ")
              : null,
          meta: {
            mode: effectiveMode,
            customerLabel: customerLabel || null,
            deviceId: deviceId || null,
            fraudScore: fraudResult.riskScore || 0,
            fraudReasons: fraudResult.reasons || [],
          },
        },
      ],
      { session: mongoSession },
    );

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
      data: {
        ...(typeof order?.toObject === "function" ? order.toObject() : order),
        orderId: order._id,
      },
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
  const { station, stationId, includeServed } = req.query;
  const restaurantId = req.user.restaurantId;
  const chefStationId = req.user?.kitchenStationId
    ? String(req.user.kitchenStationId)
    : null;

  const shouldIncludeServed =
    String(includeServed || "").toLowerCase() === "true";

  const effectiveStationId = stationId || chefStationId;
  const effectiveStation = station || null;

  if (!effectiveStationId && !effectiveStation) {
    return res.status(400).json({
      message: "station or stationId required",
      error: true,
      success: false,
    });
  }

  const stationMatch = [];
  if (effectiveStation) {
    stationMatch.push({ "items.station": effectiveStation });
  }
  if (
    effectiveStationId &&
    mongoose.Types.ObjectId.isValid(effectiveStationId)
  ) {
    stationMatch.push({
      "items.kitchenStationId": new mongoose.Types.ObjectId(effectiveStationId),
    });
  }

  const query = {
    restaurantId,
    ...(stationMatch.length ? { $or: stationMatch } : {}),
  };

  // Kitchen queue default: active (not fully served) OPEN orders only.
  if (!shouldIncludeServed) {
    query.orderStatus = "OPEN";
    query["items.itemStatus"] = { $ne: "SERVED" };
  }

  const orders = await Order.find(query).sort({
    createdAt: shouldIncludeServed ? -1 : 1,
  });

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

    const itemIndex = order.items.findIndex(
      (i) => String(i._id) === String(itemId),
    );

    const {
      orderStatus,
      totalItems,
      readyCount,
      servedCount,
      servingCount,
      inProgressCount,
      newCount,
    } = deriveLiveOrderStatusFromItems(order.items);

    // 🔥 Unified socket emit for all roles
    await emitOrderItemStatusUpdate({
      orderId: String(orderId),
      restaurantId: String(order.restaurantId),
      sessionId: String(order.sessionId),
      tableId: String(order.tableId),
      tableName: order.tableName || "Unknown",
      itemId: String(itemId),
      itemIndex,
      itemName: item.name,
      itemStatus: normalizedStatus,
      chefId: String(chefId),
      chefName: req.user?.name || "Chef",
      orderStatus,
      totalItems,
      readyCount,
      servedCount,
      servingCount,
      inProgressCount,
      newCount,
      updatedAt: now,
    });

    const allReadyForServing =
      totalItems > 0 &&
      order.items.every((i) => ["READY", "SERVED"].includes(i.itemStatus));

    if (allReadyForServing) {
      await emitOrderReady({
        orderId: String(order._id),
        restaurantId: String(order.restaurantId),
        sessionId: String(order.sessionId),
        tableId: String(order.tableId),
        tableName: order.tableName,
        orderNumber: order.orderNumber,
        readyAt: now,
      });
    }

    if (orderStatus === "SERVED") {
      await emitOrderServed({
        orderId: String(order._id),
        restaurantId: String(order.restaurantId),
        sessionId: String(order.sessionId),
        tableId: String(order.tableId),
        tableName: order.tableName,
        orderNumber: order.orderNumber,
        servedBy: String(chefId),
        servedAt: now,
      });
    }

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

    // Validate user is authenticated
    if (!user) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized - user not found",
      });
    }

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

    // Build filter
    const filter = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    // Determine which restaurant(s) to use based on role
    if (user.role === "BRAND_ADMIN") {
      if (!user.brandId) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Brand access not configured",
        });
      }

      const brandRestaurants = await Restaurant.find({
        brandId: user.brandId,
      })
        .select("_id")
        .lean();

      const brandRestaurantIds = brandRestaurants.map((r) => r._id.toString());

      if (restaurantId && restaurantId.trim()) {
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
          return res.status(400).json({
            success: false,
            error: true,
            message: "Invalid restaurantId",
          });
        }

        if (!brandRestaurantIds.includes(restaurantId)) {
          return res.status(403).json({
            success: false,
            error: true,
            message: "Access denied to this restaurant",
          });
        }

        filter.restaurantId = restaurantId;
      } else {
        filter.restaurantId = { $in: brandRestaurantIds };
      }
    } else if (user.role === "MANAGER") {
      const managerRestaurantId = user.restaurantId;

      if (!managerRestaurantId) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Restaurant access not configured",
        });
      }

      if (
        restaurantId &&
        restaurantId.trim() &&
        restaurantId !== String(managerRestaurantId)
      ) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Access denied to this restaurant",
        });
      }

      filter.restaurantId = managerRestaurantId;
    } else if (restaurantId && restaurantId.trim()) {
      if (mongoose.Types.ObjectId.isValid(restaurantId)) {
        filter.restaurantId = restaurantId;
      } else {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid restaurantId",
        });
      }
    } else if (user.restaurantId && user.restaurantId.trim?.()) {
      if (mongoose.Types.ObjectId.isValid(user.restaurantId)) {
        filter.restaurantId = user.restaurantId;
      }
    }

    const parsedLimit = Math.min(parseInt(limit) || 10, 500); // Cap at 500

    const orders = await Order.find(filter)
      .select(
        "orderNumber tableName totalAmount orderStatus createdAt updatedAt items restaurantId",
      )
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();

    return res.json({
      success: true,
      error: false,
      data: orders,
    });
  } catch (err) {
    console.error("recentOrdersController error:", err);
    return res.status(500).json({
      message: "Failed to fetch recent orders",
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

    await emitOrderPlaced({
      orderId: order._id,
      restaurantId: order.restaurantId,
      sessionId: order.sessionId,
      tableId: order.tableId,
      tableName: order.tableName,
      orderNumber: order.orderNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      placedBy: manager?._id || null,
      placedAt: order.createdAt,
    });

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
