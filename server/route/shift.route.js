// src/routes/shift.routes.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  openShiftController,
  refreshShiftQrController,
  closeShiftController,
  getActiveShiftController,
} from "../controller/shift.controller.js";

const shiftRouter = express.Router();

/* ======================================================
   MANAGER SHIFT ROUTES
====================================================== */

/**
 * Open restaurant shift (generates QR)
 */
shiftRouter.post(
  "/open",
  requireAuth,
  requireRole("MANAGER"),
  openShiftController
);

/**
 * Refresh QR code (rotate token)
 */
shiftRouter.post(
  "/refresh-qr",
  requireAuth,
  requireRole("MANAGER"),
  refreshShiftQrController
);

/**
 * Close shift (invalidate QR, end day)
 */
shiftRouter.post(
  "/close",
  requireAuth,
  requireRole("MANAGER"),
  closeShiftController
);

/**
 * Get currently active shift (for UI)
 */
shiftRouter.get(
  "/active",
  requireAuth,
  requireRole("MANAGER"),
  getActiveShiftController
);

export default shiftRouter;
