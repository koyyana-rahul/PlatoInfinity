// src/routes/order.js
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js"; // optional: allow unauth customer placing order with sessionToken
import { placeOrderController } from "../controller/order.controller.js";
import requireSessionAuth from "../middleware/requireSessionAuth.js";

const orderRouter = express.Router();

// allow unauthenticated placing using sessionToken (customer). If you want only waiter, add requireAuth.
orderRouter.post("/orders", requireSessionAuth(), placeOrderController);

export default orderRouter;
