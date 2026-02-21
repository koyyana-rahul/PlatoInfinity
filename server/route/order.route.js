import express from "express";
import { resolveCustomerSession } from "../middleware/resolveCustomerSession.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  placeOrderController,
  listSessionOrdersController,
  listKitchenOrdersController,
  updateOrderItemStatusController,
  completeOrderController,
  recentOrdersController,
  getOrderController,
  getSessionOrdersController,
  approveOrderController,
  rejectOrderController,
} from "../controller/order.controller.js";

const orderRouter = express.Router();

/**
 * ============================
 * CUSTOMER / SESSION FLOW
 * ============================
 */

// PLACE ORDER (FROM CART)
orderRouter.post("/order/place", resolveCustomerSession, placeOrderController);

// GET ORDER DETAILS
orderRouter.get("/order/:orderId", resolveCustomerSession, getOrderController);

// LIST ORDERS FOR A SESSION (Customer / Waiter view)
orderRouter.get(
  "/order/session/:sessionId",
  resolveCustomerSession,
  getSessionOrdersController,
);

orderRouter.get(
  "/order/table/:tableId",
  resolveCustomerSession,
  listSessionOrdersController,
);

/**
 * ============================
 * STAFF VIEW
 * ============================
 */

// STAFF VIEW: LIST ORDERS FOR A SESSION
orderRouter.get(
  "/order/session/:sessionId/staff",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  listSessionOrdersController,
);

/**
 * ============================
 * ADMIN DASHBOARD
 * ============================
 */

// GET RECENT ORDERS (ADMIN DASHBOARD)
orderRouter.get("/order/recent", requireAuth, recentOrdersController);

/**
 * ============================
 * KITCHEN FLOW
 * ============================
 */

// LIST KITCHEN ORDERS BY STATION
orderRouter.get(
  "/kitchen/orders",
  requireAuth,
  requireRole("CHEF"),
  listKitchenOrdersController,
);

// UPDATE ORDER ITEM STATUS
orderRouter.post(
  "/kitchen/order/:orderId/item/:itemId/status",
  requireAuth,
  requireRole("CHEF"),
  updateOrderItemStatusController,
);

/**
 * ============================
 * BILLING FLOW
 * ============================
 */

// COMPLETE ORDER
orderRouter.post(
  "/order/:orderId/complete",
  requireAuth,
  requireRole("WAITER", "MANAGER", "CASHIER"),
  completeOrderController,
);

/**
 * ============================
 * FRAUD MANAGEMENT
 * ============================
 */

// MANAGER APPROVAL OF SUSPICIOUS ORDERS
orderRouter.put(
  "/order/:orderId/approve",
  requireAuth,
  requireRole("MANAGER"),
  approveOrderController,
);

// MANAGER REJECTION OF SUSPICIOUS ORDERS
orderRouter.put(
  "/order/:orderId/reject",
  requireAuth,
  requireRole("MANAGER"),
  rejectOrderController,
);

export default orderRouter;
