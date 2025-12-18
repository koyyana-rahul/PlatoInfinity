import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { requireSessionAuth } from "../middleware/requireSessionAuth.js";

import {
  generateBillController,
  payBillController,
  getBillBySessionController,
  getCustomerBillController,
} from "../controller/bill.controller.js";

const billRouter = express.Router();

/**
 * =========================
 * STAFF (WAITER / MANAGER)
 * =========================
 */

// Generate bill (after orders)
billRouter.post(
  "/bill/session/:sessionId",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  generateBillController
);

// Pay bill
billRouter.post(
  "/bill/:billId/pay",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  payBillController
);

// Staff view bill
billRouter.get(
  "/bill/session/:sessionId",
  requireAuth,
  getBillBySessionController
);

/**
 * =========================
 * CUSTOMER (SESSION BASED)
 * =========================
 */

// 👇 CUSTOMER VIEW BILL (NO LOGIN)
billRouter.get("/customer/bill", requireSessionAuth, getCustomerBillController);

export default billRouter;
