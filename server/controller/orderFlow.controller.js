/**
 * COMPLETE ORDER FLOW CONTROLLER
 * Handles customer order placement with:
 * - Table PIN verification (from waiter)
 * - Fraud detection
 * - Kitchen routing to appropriate stations
 * - Order status tracking
 * - Real-time socket.io notifications
 */

import mongoose from "mongoose";
import Order from "../models/order.model.js";
import CartItem from "../models/cartItem.model.js";
import SessionModel from "../models/session.model.js";
import Table from "../models/table.model.js";
import BranchMenuItem from "../models/branchMenuItem.model.js";
import SuspiciousOrder from "../models/suspiciousOrder.model.js";
import AuditLog from "../models/auditLog.model.js";

import {
  emitOrderPlaced,
  emitFraudAlert,
  emitQuantityAlert,
  emitTableStatusChanged,
  emitMetricsUpdate,
} from "../socket/emitter.js";

import {
  detectOrderFraud,
  logSuspiciousOrder,
  shouldAutoApprove,
} from "../utils/fraudDetection.js";

import {
  routeOrderToStations,
  estimatePrepTime,
  getChefPendingItems,
} from "../utils/kitchenRouting.js";

/**
 * =====================================================
 * POST /api/order/place
 * =====================================================
 * MAIN ORDER PLACEMENT FLOW
 *
 * Customer journey:
 * 1. Cart loaded in browser (local storage)
 * 2. Waiter comes → app shows cart → waiter approves
 * 3. Waiter gives current 4-digit Table PIN
 * 4. Customer enters PIN
 * 5. First order: Choose mode (FAMILY/INDIVIDUAL) + optional label
 * 6. Submit order → validates PIN → routes to kitchen
 *
 * Auth: requireSessionAuth (session token from URL)
 */
export async function placeOrderController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const session = req.sessionDoc; // From middleware
    const { tablePin, mode, customerLabel, deviceId } = req.body;

    // ✅ 1️⃣ VALIDATE SESSION & PIN
    if (!session || session.status !== "OPEN") {
      await mongoSession.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Session is not open or invalid",
      });
    }

    if (!tablePin) {
      await mongoSession.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Table PIN required. Please ask waiter for the PIN.",
      });
    }

    // Verify the PIN (must match current session PIN)
    const pinVerified = await session.verifyPin(String(tablePin));
    if (!pinVerified.success) {
      await mongoSession.abortTransaction();
      return res.status(401).json({
        success: false,
        message: pinVerified.message || "Invalid PIN",
        isBlocked: pinVerified.isBlocked || false,
        attemptsLeft: pinVerified.attemptsLeft || 0,
      });
    }

    // ✅ 2️⃣ DETERMINE BILLING MODE
    const existingOrders = await Order.countDocuments({
      sessionId: session._id,
    });

    const requestedMode = mode ? String(mode).toUpperCase() : null;

    // First order: can choose FAMILY (default) or INDIVIDUAL
    let effectiveMode;
    if (existingOrders === 0 && requestedMode) {
      effectiveMode = requestedMode;
      session.mode = effectiveMode;
      await session.save({ session: mongoSession });
    } else {
      // Subsequent orders: use existing session mode
      effectiveMode = session.mode || "FAMILY";
    }

    // For INDIVIDUAL mode, label is customer identifier
    let customerIdentifier = null;
    if (effectiveMode === "INDIVIDUAL") {
      if (!deviceId && !customerLabel) {
        await mongoSession.abortTransaction();
        return res.status(400).json({
          success: false,
          message:
            "For individual billing, please provide a label (e.g., 'Rahul', 'Blue Shirt')",
        });
      }
      customerIdentifier = customerLabel || deviceId;
    }

    // ✅ 3️⃣ LOAD CART ITEMS
    const cartFilter = {
      sessionId: session._id,
    };

    if (effectiveMode === "INDIVIDUAL") {
      cartFilter.deviceId = deviceId;
    }

    const cartItems = await CartItem.find(cartFilter).session(mongoSession);

    if (!cartItems || cartItems.length === 0) {
      await mongoSession.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add items first.",
      });
    }

    // ✅ 4️⃣ BUILD ORDER ITEMS & VALIDATE
    let orderItems = [];
    let totalAmount = 0;
    const menuItemMap = new Map();

    for (const cartItem of cartItems) {
      const menuItem = await BranchMenuItem.findById(
        cartItem.branchMenuItemId,
      ).session(mongoSession);

      if (!menuItem) {
        await mongoSession.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Item "${cartItem.name}" no longer available`,
        });
      }

      const itemTotal =
        (menuItem.finalPrice || menuItem.price) * cartItem.quantity;

      const orderItem = {
        branchMenuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.finalPrice || menuItem.price,
        quantity: cartItem.quantity,
        selectedModifiers: cartItem.selectedModifiers || [],
        itemStatus: "NEW",
        station: menuItem.category || "GENERAL",
        kitchenStationId: menuItem.kitchenStationId || null,
        meta: {
          customization: cartItem.notes || {
            spiceLevel: cartItem.spiceLevel,
            noOnion: cartItem.noOnion,
            jain: cartItem.jain,
          },
        },
      };

      orderItems.push(orderItem);
      totalAmount += itemTotal;
      menuItemMap.set(menuItem._id.toString(), menuItem);
    }

    // ✅ 5️⃣ FRAUD DETECTION
    const tempOrder = {
      _id: new mongoose.Types.ObjectId(),
      restaurantId: session.restaurantId,
      tableId: session.tableId,
      items: orderItems,
      totalAmount,
      createdAt: new Date(),
    };

    const fraudResult = await detectOrderFraud(tempOrder, {
      id: session.restaurantId,
    });

    let orderStatus = "OPEN";
    let autoApproved = true;

    if (fraudResult.isFraudulent) {
      autoApproved = false;
      orderStatus = "PENDING_APPROVAL";

      // Log suspicious order
      await logSuspiciousOrder(tempOrder, fraudResult).session(mongoSession);

      // Emit alert to managers
      console.warn(
        `⚠️ FRAUD ALERT: Order for Table ${session.tableId} - Risk: ${fraudResult.riskScore}`,
      );
      emitFraudAlert(session.restaurantId, tempOrder, fraudResult);
    } else if (!shouldAutoApprove(fraudResult)) {
      autoApproved = false;
      orderStatus = "PENDING_APPROVAL";
    }

    // ✅ 6️⃣ CREATE ORDER IN DATABASE
    const order = new Order({
      restaurantId: session.restaurantId,
      sessionId: session._id,
      tableId: session.tableId,
      tableName: session.tableName,
      items: orderItems,
      orderStatus,
      totalAmount,
      isSuspicious: fraudResult.riskScore >= 30,
      suspiciousReason:
        fraudResult.reasons.length > 0 ? fraudResult.reasons.join(", ") : null,
      meta: {
        mode: effectiveMode,
        customerLabel: customerIdentifier,
        fraudScore: fraudResult.riskScore,
        autoApproved,
      },
    });

    await order.save({ session: mongoSession });

    // ✅ 7️⃣ ROUTE TO KITCHEN STATIONS
    const stationRouting = await routeOrderToStations(
      orderItems,
      session.restaurantId,
    );

    // Update order items with station assignments
    for (const item of order.items) {
      for (const [stationId, stationItems] of Object.entries(stationRouting)) {
        const matchedItem = stationItems.find(
          (si) => si.name === item.name && si.quantity === item.quantity,
        );
        if (matchedItem) {
          item.station = matchedItem.stationType;
          break;
        }
      }
    }

    await order.save({ session: mongoSession });

    // ✅ 8️⃣ UPDATE TABLE & SESSION STATUS
    const table = await Table.findByIdAndUpdate(
      session.tableId,
      {
        status: "OCCUPIED",
        lastActivity: new Date(),
      },
      { new: true, session: mongoSession },
    );

    emitTableStatusChanged(session.restaurantId, table);

    // ✅ 9️⃣ ESTIMATE PREP TIME
    const prepTime = await estimatePrepTime(orderItems, session.restaurantId);

    // ✅ 1️⃣0️⃣ DELETE CART (satisfied orders)
    await CartItem.deleteMany(cartFilter).session(mongoSession);

    // ✅ 1️⃣1️⃣ CREATE AUDIT LOG
    await AuditLog.create(
      [
        {
          action: "ORDER_PLACED",
          userId: null, // customer, anonymous
          restaurantId: session.restaurantId,
          resourceType: "Order",
          resourceId: order._id,
          changes: {
            items: order.items.length,
            amount: totalAmount,
            status: orderStatus,
          },
        },
      ],
      { session: mongoSession },
    );

    // ✅ 1️⃣2️⃣ BROADCAST TO STAFF
    emitOrderPlaced({
      orderId: order._id,
      restaurantId: session.restaurantId,
      sessionId: session._id,
      tableId: session.tableId,
      tableName: session.tableName,
      orderNumber: order.orderNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      placedBy: "CUSTOMER",
      placedAt: order.createdAt,
    });

    // Commit transaction
    await mongoSession.commitTransaction();

    // ✅ SUCCESS RESPONSE
    return res.status(201).json({
      success: true,
      message: autoApproved
        ? "Order placed successfully!"
        : "Order submitted for approval",
      data: {
        orderId: order._id,
        status: orderStatus,
        items: order.items.length,
        totalAmount,
        prepTime: `${prepTime} minutes`,
        autoApproved,
        fraudWarning: fraudResult.riskScore > 20 ? fraudResult.reasons : null,
      },
    });
  } catch (error) {
    await mongoSession.abortTransaction();
    console.error("Place order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    mongoSession.endSession();
  }
}

/**
 * =====================================================
 * GET /api/order/:orderId
 * =====================================================
 * Get order details with live status
 */
export async function getOrderController(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("tableId", "tableName")
      .populate("restaurantId", "name")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Calculate order progress
    const allReady = order.items?.every((i) => i.itemStatus === "READY");
    const allServed = order.items?.every((i) => i.itemStatus === "SERVED");
    const anyServed = order.items?.some((i) => i.itemStatus === "SERVED");

    return res.status(200).json({
      success: true,
      data: {
        ...order,
        progress: {
          allItemsReady: allReady,
          allItemsServed: allServed,
          someItemsServed: anyServed,
          readyCount: order.items?.filter((i) => i.itemStatus === "READY")
            .length,
          servedCount: order.items?.filter((i) => i.itemStatus === "SERVED")
            .length,
        },
      },
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
}

/**
 * =====================================================
 * GET /api/order/session/:sessionId
 * =====================================================
 * Get all orders for a session (customer view)
 */
export async function getSessionOrdersController(req, res) {
  try {
    const { sessionId } = req.params;

    const orders = await Order.find({
      sessionId,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get session orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}

/**
 * =====================================================
 * PUT /api/order/:orderId/approve
 * =====================================================
 * Manager approves suspicious order
 */
export async function approveOrderController(req, res) {
  try {
    const { orderId } = req.params;
    const managerId = req.user?._id;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: "APPROVED",
        isSuspicious: false,
      },
      { new: true },
    ).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update suspicious order record
    await SuspiciousOrder.findOneAndUpdate(
      { orderId },
      {
        status: "APPROVED",
        approvedByUserId: managerId,
        approvedAt: new Date(),
      },
    );

    // Broadcast to kitchen and staff
    emitOrderPlaced({
      orderId: order._id,
      restaurantId: order.restaurantId,
      sessionId: order.sessionId,
      tableId: order.tableId,
      tableName: order.tableName,
      orderNumber: order.orderNumber,
      items: order.items || [],
      totalAmount: order.totalAmount,
      placedBy: "MANAGER_APPROVED",
      placedAt: order.createdAt,
    });

    return res.status(200).json({
      success: true,
      message: "Order approved",
      data: order,
    });
  } catch (error) {
    console.error("Approve order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve order",
    });
  }
}

/**
 * =====================================================
 * PUT /api/order/:orderId/reject
 * =====================================================
 * Manager rejects suspicious order
 */
export async function rejectOrderController(req, res) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const managerId = req.user?._id;

    if (!managerId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        orderStatus: "CANCELLED",
        meta: {
          ...order.meta,
          rejectionReason: reason || "Manager decision",
          rejectedBy: managerId,
        },
      },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update suspicious order record
    await SuspiciousOrder.findOneAndUpdate(
      { orderId },
      {
        status: "REJECTED",
        rejectedByUserId: managerId,
        rejectedAt: new Date(),
      },
    );

    return res.status(200).json({
      success: true,
      message: "Order rejected",
      data: order,
    });
  } catch (error) {
    console.error("Reject order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject order",
    });
  }
}
