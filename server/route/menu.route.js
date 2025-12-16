import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  importMasterMenu,
  listBranchMenu,
  listBranchMenuGrouped,
  updateBranchMenuItem,
  bulkToggleBranchMenu,
  updateBranchStock,
  syncBranchWithMaster,
} from "../controller/menu.controller.js";

const menuRouter = express.Router();

menuRouter.use(requireAuth, requireRole("MANAGER"));

menuRouter.post("/:restaurantId/import", importMasterMenu);
menuRouter.get("/:restaurantId", listBranchMenu);
menuRouter.get("/:restaurantId/grouped", listBranchMenuGrouped);
menuRouter.patch("/:restaurantId/item/:itemId", updateBranchMenuItem);
menuRouter.patch("/:restaurantId/item/:itemId/stock", updateBranchStock);
menuRouter.post("/:restaurantId/bulk-toggle", bulkToggleBranchMenu);
menuRouter.post("/:restaurantId/sync-with-master", syncBranchWithMaster);

export default menuRouter;
