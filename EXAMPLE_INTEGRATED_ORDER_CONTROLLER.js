/**
 * EXAMPLE: Updated Order Controller
 *
 * This shows how to integrate the new services into your existing
 * order placement endpoint. Copy and adapt to your actual controller.
 */

import OrderModel from "../models/order.model.js";
import CartItemModel from "../models/cartItem.model.js";
import { createOrderFromCartTransaction } from "../services/order.transaction.service.js";
import { auditFunctions } from "../services/auditLog.service.js";

/* ========== PLACE ORDER ENDPOINT ========== */
export async function placeOrderController(req, res) {
  try {
    const { sessionId, restaurantId, paymentMethod } = req.body;
    const idempotencyKey = req.idempotencyKey; // From middleware
    const userId = req.user?._id; // From auth middleware (staff only)

    /* ========== VALIDATION ========== */
    if (!sessionId || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: "sessionId and restaurantId required",
      });
    }

    /* ========== CHECK CART ========== */
    const cartItemCount = await CartItemModel.countDocuments({
      sessionId,
      restaurantId,
    });

    if (cartItemCount === 0) {
      await auditFunctions.logSuspiciousActivity(req, {
        sessionId,
        restaurantId,
        reason: "Attempted order with empty cart",
        details: { userId },
      });

      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    /* ========== CREATE ORDER (ATOMIC TRANSACTION) ========== */
    try {
      const result = await createOrderFromCartTransaction({
        sessionId,
        restaurantId,
        tableId: req.body.tableId, // From session or request
        tableName: req.body.tableName, // From session or request
        paymentMethod,
        idempotencyKey, // For duplicate prevention
      });

      /* ========== AUDIT LOG: ORDER PLACED ========== */
      await auditFunctions.logOrderPlaced(req, {
        sessionId,
        orderId: result.orderId,
        restaurantId,
        amount: result.totalAmount,
        itemCount: result.itemCount,
      });

      /* ========== EMIT SOCKET EVENT FOR KITCHEN ========== */
      // Kitchen staff alerted in real-time
      const io = getSocketInstance(); // Your global socket reference
      io.to(`restaurant:${restaurantId}:kitchen`).emit("new-order", {
        orderId: result.orderId,
        tableNumber: req.body.tableName,
        itemCount: result.itemCount,
      });

      /* ========== RESPONSE ========== */
      return res.json({
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: result.orderId,
          totalAmount: result.totalAmount,
          itemCount: result.itemCount,
          orderStatus: "OPEN",
          estimatedPrepTime: calculatePrepTime(result.itemCount),
        },
      });
    } catch (txnError) {
      /* ========== TRANSACTION FAILED ========== */
      await auditFunctions.logOrderCancelled(req, {
        sessionId,
        orderId: null,
        restaurantId,
        reason: `Order placement failed: ${txnError.message}`,
      });

      console.error("❌ Order transaction failed:", txnError);

      return res.status(500).json({
        success: false,
        message: "Order placement failed. Please try again or contact staff.",
        code: txnError.code || "ORDER_FAILED",
        // Can be retried with same idempotencyKey
      });
    }
  } catch (err) {
    console.error("❌ Order placement error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during order placement",
    });
  }
}

/* ========== RESUME FAILED ORDER ========== */
export async function resumeOrderPlacementController(req, res) {
  try {
    const { sessionId, restaurantId, idempotencyKey } = req.body;

    if (!sessionId || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "sessionId and idempotencyKey required",
      });
    }

    // Check if order was already placed
    const existingOrder = await OrderModel.findOne({
      sessionId,
      clientRequestId: idempotencyKey,
    });

    if (existingOrder) {
      return res.json({
        success: true,
        resumed: true,
        orderId: existingOrder._id,
        message: "Your order was already placed successfully!",
      });
    }

    // Check if cart still has items
    const cartItems = await CartItemModel.find({
      sessionId,
      restaurantId,
    });

    if (!cartItems.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. No order to resume.",
      });
    }

    // Ready to retry
    return res.json({
      success: true,
      resumed: false,
      readyToRetry: true,
      cartItemCount: cartItems.length,
      message: "Your cart is intact. Ready to place order again.",
    });
  } catch (err) {
    console.error("Resume order failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to check order status",
    });
  }
}

/* ========== GET ORDER DETAILS (Customer) ========== */
export async function getOrderDetailsController(req, res) {
  try {
    const { sessionId, orderId } = req.params;

    const order = await OrderModel.findOne({
      _id: orderId,
      sessionId, // Verify ownership
    }).populate("items.branchMenuItemId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      data: {
        orderId: order._id,
        status: order.orderStatus,
        totalAmount: order.totalAmount,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          itemStatus: item.itemStatus, // NEW, IN_PROGRESS, READY, SERVED
          readyAt: item.readyAt,
        })),
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Get order details failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
}

/* ========== KITCHEN: GET ORDERS (No Pricing) ========== */
export async function getKitchenOrdersController(req, res) {
  try {
    const { restaurantId, stationFilter } = req.query;
    const userRole = req.user?.role; // Should be CHEF

    if (userRole !== "CHEF") {
      return res.status(403).json({
        success: false,
        message: "Only kitchen staff can view this",
      });
    }

    const kitchenService =
      await import("../services/kitchen.display.service.js");
    const result = await kitchenService.getKitchenOrders({
      restaurantId,
      stationFilter,
    });

    return res.json(result);
  } catch (err) {
    console.error("Get kitchen orders failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch kitchen orders",
    });
  }
}

/* ========== KITCHEN: UPDATE ITEM STATUS ========== */
export async function updateKitchenItemStatusController(req, res) {
  try {
    const { orderId, itemIndex } = req.params;
    const { newStatus } = req.body;
    const chefId = req.user?._id;

    const kitchenService =
      await import("../services/kitchen.display.service.js");
    const result = await kitchenService.updateItemStatusKitchen({
      orderId,
      itemIndex: parseInt(itemIndex),
      newStatus,
      chefId,
    });

    /* ========== AUDIT LOG ========== */
    await auditFunctions.logStaffAction(req, {
      userId: chefId,
      restaurantId: req.body.restaurantId,
      actionDescription: `Updated order item status to ${newStatus}`,
      details: { orderId, itemIndex, newStatus },
    });

    /* ========== EMIT REAL-TIME UPDATE ========== */
    const io = getSocketInstance();
    io.to(`restaurant:${req.body.restaurantId}:customer`).emit(
      "order-item-updated",
      {
        orderId,
        itemIndex,
        status: newStatus,
      },
    );

    return res.json(result);
  } catch (err) {
    console.error("Update item status failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update item status",
    });
  }
}

/* ========== ROUTE SETUP ========== */
export function setupOrderRoutes(router) {
  // Place order (with idempotency and transactions)
  router.post("/orders/place", placeOrderController);

  // Resume failed order
  router.post("/orders/resume", resumeOrderPlacementController);

  // Get order details
  router.get("/orders/:sessionId/:orderId", getOrderDetailsController);

  // Kitchen orders (no pricing)
  router.get("/kitchen/orders", getKitchenOrdersController);

  // Update item status (kitchen)
  router.patch(
    "/kitchen/orders/:orderId/items/:itemIndex/status",
    updateKitchenItemStatusController,
  );

  return router;
}

export default {
  placeOrderController,
  resumeOrderPlacementController,
  getOrderDetailsController,
  getKitchenOrdersController,
  updateKitchenItemStatusController,
  setupOrderRoutes,
};
