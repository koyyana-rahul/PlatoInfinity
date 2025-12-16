import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  listKitchenOrders,
  updateKitchenItemStatus,
} from "../controller/kitchen.controller.js";

const kitchenRouter = express.Router();

kitchenRouter.use(requireAuth, requireRole("CHEF"));

kitchenRouter.get("/orders", listKitchenOrders);
kitchenRouter.post(
  "/order/:orderId/item/:itemId/status",
  updateKitchenItemStatus
);

export default kitchenRouter;
