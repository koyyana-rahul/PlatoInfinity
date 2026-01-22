// src/routes/session.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  openTableSessionController,
  joinSessionController,
  shiftTableController,
  closeSessionController,
  getSessionController,
  listRestaurantSessionsController,
} from "../controller/session.controller.js";
import requireSessionAuth from "../middleware/requireSessionAuth.js";

const sessionRouter = express.Router();

// Waiter opens session (manager/waiter)
sessionRouter.post(
  "/restaurants/:restaurantId/sessions/open",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  openTableSessionController,
);

// Shift table and close session (waiter)
sessionRouter.post(
  "/restaurants/:restaurantId/sessions/:sessionId/shift",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  shiftTableController,
);
sessionRouter.post(
  "/restaurants/:restaurantId/sessions/:sessionId/close",
  requireAuth,
  requireRole("WAITER", "MANAGER", "CASHIER"),
  closeSessionController,
);
// Manager/waiter fetch session
sessionRouter.get(
  "/restaurants/:restaurantId/sessions/:sessionId",
  requireAuth,
  requireRole("WAITER", "MANAGER"),
  getSessionController,
);

// List sessions for a restaurant (waiter/manager/cashier)
sessionRouter.get(
  "/restaurants/:restaurantId/sessions",
  requireAuth,
  requireRole("WAITER", "MANAGER", "CASHIER"),
  listRestaurantSessionsController,
);

// Public: customer joins session via QR -> sends restaurantId + tableId + tablePin
sessionRouter.post("/sessions/join", joinSessionController);

export default sessionRouter;
