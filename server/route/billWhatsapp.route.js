import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { generateBillController } from "../controller/bill.controller.js";
import { sendBillOnWhatsAppController } from "../controller/billWhatsapp.controller.js";

const whatsappRouter = express.Router();

/**
 * WAITER / MANAGER
 */

whatsappRouter.post(
  "/bill/:billId/whatsapp",
  requireAuth,
  requireRole("WAITER", "MANAGER", "CASHIER"),
  sendBillOnWhatsAppController
);
whatsappRouter.post(
  "/bill/:sessionId/generate",
  requireAuth,
  requireRole("WAITER", "MANAGER", "CASHIER"),
  generateBillController
);

export default whatsappRouter;
