// src/routes/staff.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createStaffController,
  listStaffController,
  regenerateStaffPinController,
  staffLoginController,
} from "../controller/staff.controller.js";

const staffRouter = express.Router();

// Manager-only staff management
staffRouter.post(
  "/restaurants/:restaurantId/staff",
  requireAuth,
  requireRole("MANAGER"),
  createStaffController
);
staffRouter.get(
  "/restaurants/:restaurantId/staff",
  requireAuth,
  requireRole("MANAGER"),
  listStaffController
);
staffRouter.post(
  "/restaurants/:restaurantId/staff/:staffId/regenerate-pin",
  requireAuth,
  requireRole("MANAGER"),
  regenerateStaffPinController
);

// Public staff login
staffRouter.post("/auth/staff-login", staffLoginController);

export default staffRouter;
