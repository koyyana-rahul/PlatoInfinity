import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { serveOrderItemController } from "../controller/waiter.controller.js";

const waiterRouter = express.Router();

waiterRouter.use(requireAuth, requireRole("WAITER", "MANAGER"));

// Serve item
waiterRouter.post(
  "/order/:orderId/item/:itemId/serve",
  serveOrderItemController
);

export default waiterRouter;
