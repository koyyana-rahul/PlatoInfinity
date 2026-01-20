import express from "express";
import { requireSessionAuth } from "../middleware/requireSessionAuth.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  placeOrderController,
  listSessionOrdersController,
  listKitchenOrdersController,
  updateOrderItemStatusController,
  completeOrderController,
} from "../controller/order.controller.js";

const orderRouter = express.Router();

/**
 * ============================
 * CUSTOMER / SESSION FLOW
 * ============================
 */

/**
 * PLACE ORDER (FROM CART)
 * Uses session cookie / x-session-token
 */
orderRouter.post("/order/place", requireSessionAuth, placeOrderController);

/**
 * LIST ORDERS FOR A SESSION
 * (Customer / Waiter view)
 */
orderRouter.get(
  "/order/session/:sessionId",
  requireSessionAuth,
  listSessionOrdersController
);

/**
 * STAFF VIEW: LIST ORDERS FOR A SESSION
 * (Waiter / Manager)
 */
orderRouter.get(
  "/order/session/:sessionId/staff",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  listSessionOrdersController
);

/**
 * ============================
 * KITCHEN FLOW (CHEF)
 * ============================
 */

/**
 * LIST KITCHEN ORDERS BY STATION
 * Query: ?station=TANDOOR
 */
orderRouter.get(
  "/kitchen/orders",
  requireAuth,
  requireRole("CHEF"),
  listKitchenOrdersController
);

/**
 * UPDATE ORDER ITEM STATUS
 * PREPARING → READY → SERVED
 */
orderRouter.post(
  "/kitchen/order/:orderId/item/:itemId/status",
  requireAuth,
  requireRole("CHEF"),
  updateOrderItemStatusController
);

/**
 * ============================
 * BILLING FLOW (WAITER / MANAGER)
 * ============================
 */

/**
 * COMPLETE ORDER (AFTER PAYMENT)
 */
orderRouter.post(
  "/order/:orderId/complete",
  requireAuth,
  requireRole("WAITER", "MANAGER", "CASHIER"),
  completeOrderController
);

export default orderRouter;
