import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  listManagersController,
  inviteManagerController,
  removeManagerController,
} from "../controller/manager.controller.js";

const router = express.Router();

/**
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

router.delete(
  "/:managerId",
  requireAuth,
  requireRole("BRAND_ADMIN"),
  removeManagerController
);

export default router;
