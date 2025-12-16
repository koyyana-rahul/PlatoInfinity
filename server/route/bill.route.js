import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  generateBillController,
  payBillController,
  getBillBySessionController,
} from "../controller/bill.controller.js";

const billRouter = express.Router();

// Waiter / Manager
billRouter.post(
  "/bill/session/:sessionId",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  generateBillController
);

billRouter.post(
  "/bill/:billId/pay",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  payBillController
);

billRouter.get(
  "/bill/session/:sessionId",
  requireAuth,
  getBillBySessionController
);

export default billRouter;
