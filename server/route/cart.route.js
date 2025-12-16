import express from "express";
import { requireSessionAuth } from "../middleware/requireSessionAuth.js";
import {
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  getCartController,
} from "../controller/cart.controller.js";

const cartRouter = express.Router();

/**
 * CUSTOMER / SESSION CART ROUTES
 * Session is identified via session token (QR flow)
 */

// ➕ Add item to cart
cartRouter.post("/cart/add", requireSessionAuth, addToCartController);

// ✏️ Update quantity
cartRouter.put("/cart/update", requireSessionAuth, updateCartItemController);

// ❌ Remove item
cartRouter.delete(
  "/cart/item/:cartItemId",
  requireSessionAuth,
  removeCartItemController
);

// 🛒 Get cart
cartRouter.get("/cart", requireSessionAuth, getCartController);

export default cartRouter;
