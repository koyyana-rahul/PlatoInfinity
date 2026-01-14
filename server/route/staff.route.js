import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  createStaffController,
  listStaffController,
  regenerateStaffPinController,
  toggleStaffActiveController,
  staffLoginController,
  endStaffShiftController,
} from "../controller/staff.controller.js";

const staffRouter = express.Router();

/* ======================================================
   MANAGER ROUTES
====================================================== */

/**
 * Create staff (WAITER / CHEF / CASHIER)
 */
staffRouter.post(
  "/restaurants/:restaurantId/staff",
  requireAuth,
  requireRole("MANAGER"),
  createStaffController
);

/**
 * List all staff of restaurant
 */
staffRouter.get(
  "/restaurants/:restaurantId/staff",
  requireAuth,
  requireRole("MANAGER"),
  listStaffController
);

/**
 * Regenerate staff PIN
 */
staffRouter.post(
  "/restaurants/:restaurantId/staff/:staffId/regenerate-pin",
  requireAuth,
  requireRole("MANAGER"),
  regenerateStaffPinController
);

/**
 * Activate / Deactivate staff
 */
staffRouter.patch(
  "/restaurants/:restaurantId/staff/:staffId/toggle-active",
  requireAuth,
  requireRole("MANAGER"),
  toggleStaffActiveController
);

/* ======================================================
   STAFF AUTH ROUTES
====================================================== */

/**
 * STAFF LOGIN (QR + PIN)
 * body: { staffPin, qrToken }
 */
staffRouter.post("/auth/staff-login", staffLoginController);

/**
 * STAFF LOGOUT (END DUTY)
 */
staffRouter.post(
  "/staff/shift/end",
  requireAuth,
  requireRole("WAITER", "CHEF", "CASHIER"),
  endStaffShiftController
);

export default staffRouter;
