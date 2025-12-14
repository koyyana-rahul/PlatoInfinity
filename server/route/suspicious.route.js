// src/routes/suspicious.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listSuspiciousOrdersController,
  getSuspiciousOrderController,
  approveSuspiciousOrderController,
  rejectSuspiciousOrderController,
} from "../controller/suspicious.controller.js";

const suspiciousRouter = express.Router();

// Manager-only
suspiciousRouter.get(
  "/manager/suspicious-orders",
  requireAuth,
  requireRole("MANAGER"),
  listSuspiciousOrdersController
);
suspiciousRouter.get(
  "/manager/suspicious-orders/:id",
  requireAuth,
  requireRole("MANAGER"),
  getSuspiciousOrderController
);
suspiciousRouter.post(
  "/manager/suspicious-orders/:id/approve",
  requireAuth,
  requireRole("MANAGER"),
  approveSuspiciousOrderController
);
suspiciousRouter.post(
  "/manager/suspicious-orders/:id/reject",
  requireAuth,
  requireRole("MANAGER"),
  rejectSuspiciousOrderController
);

export default suspiciousRouter;
