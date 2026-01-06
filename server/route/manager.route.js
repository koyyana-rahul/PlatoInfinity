import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  listManagersController,
  inviteManagerController,
  removeManagerController,
  resendInviteController,
} from "../controller/manager.controller.js";

/* 🔥 mergeParams IS REQUIRED */
const router = express.Router({ mergeParams: true });

/**
 * BASE PATH:
 * /api/restaurants/:restaurantId/managers
 */

router.get(
  "/",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  listManagersController
);

router.post(
  "/invite",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  inviteManagerController
);

router.post(
  "/:managerId/resend-invite",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  resendInviteController
);

router.delete(
  "/:managerId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  removeManagerController
);

export default router;
