// src/routes/menu.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  importMasterMenuController,
  upsertBranchMenuItemController,
  listBranchMenuController,
  toggleBranchMenuItemsController,
  syncWithMasterController,
} from "../controller/menu.controller.js";

const menuRouter = express.Router();

// Manager-only menu endpoints
menuRouter.post(
  "/manager/branch-menu/:restaurantId/import",
  requireAuth,
  requireRole("MANAGER"),
  importMasterMenuController
);
menuRouter.post(
  "/manager/branch-menu/:restaurantId",
  requireAuth,
  requireRole("MANAGER"),
  upsertBranchMenuItemController
);
menuRouter.get(
  "/manager/branch-menu/:restaurantId",
  requireAuth,
  requireRole("MANAGER"),
  listBranchMenuController
);
menuRouter.post(
  "/manager/branch-menu/:restaurantId/bulk-toggle",
  requireAuth,
  requireRole("MANAGER"),
  toggleBranchMenuItemsController
);
menuRouter.post(
  "/manager/branch-menu/:restaurantId/sync-with-master",
  requireAuth,
  requireRole("MANAGER"),
  syncWithMasterController
);

export default menuRouter;
