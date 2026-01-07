import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  createStaffController,
  // deactivateStaffController,
  listStaffController,
  regenerateStaffPinController,
  staffLoginController,
  toggleStaffActiveController,
  startShiftController,
  endShiftController,
} from "../controller/staff.controller.js";

const staffRouter = express.Router();

/* ======================================================
   MANAGER ROUTES (Protected)
====================================================== */

/**
 * Create staff (Waiter / Chef / Cashier)
 */
staffRouter.post(
  "/restaurants/:restaurantId/staff",
  requireAuth,
  requireRole("MANAGER"),
  createStaffController
);

/**
 * List staff (supports search)
 * Query params:
 *  ?q=staffCode | name | mobile
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
 * Toggle staff active / inactive (soft remove)
 */
staffRouter.patch(
  "/restaurants/:restaurantId/staff/:staffId/toggle-active",
  requireAuth,
  requireRole("MANAGER"),
  toggleStaffActiveController
);

/**
 * Permanently deactivate staff (optional / admin-level)
 */
// staffRouter.patch(
//   "/restaurants/:restaurantId/staff/:staffId/deactivate",
//   requireAuth,
//   requireRole("MANAGER"),
//   deactivateStaffController
// );

/* ======================================================
   STAFF ROUTES
====================================================== */

/**
 * Staff login using Staff PIN
 */
staffRouter.post("/auth/staff-login", staffLoginController);

/**
 * Shift start (Attendance IN)
 */
staffRouter.post(
  "/shift/start",
  requireAuth,
  requireRole("WAITER", "CHEF", "CASHIER"),
  startShiftController
);

/**
 * Shift end (Attendance OUT)
 */
staffRouter.post(
  "/shift/end",
  requireAuth,
  requireRole("WAITER", "CHEF", "CASHIER"),
  endShiftController
);

export default staffRouter;
