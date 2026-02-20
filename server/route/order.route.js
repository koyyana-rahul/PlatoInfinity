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
} from "../controller/order.controller.js";

const orderRouter = express.Router();

/**
 * ============================
 * CUSTOMER / SESSION FLOW
 * ============================
 */

// PLACE ORDER (FROM CART)
orderRouter.post("/order/place", resolveCustomerSession, placeOrderController);

// LIST ORDERS FOR A SESSION (Customer / Waiter view)
orderRouter.get(
  "/order/session/:sessionId",
  resolveCustomerSession,
  listSessionOrdersController,
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

export default orderRouter;
