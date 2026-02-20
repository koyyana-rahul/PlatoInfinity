import express from "express";
import { resolveCustomerSession } from "../middleware/resolveCustomerSession.js";
import {
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  getCartController,
} from "../controller/cart.controller.js";

const cartRouter = express.Router();

/**
 * CUSTOMER / SESSION CART ROUTES
 * Session identified via QR session token
 */

// ➕ Add item to cart
cartRouter.post("/cart/add", resolveCustomerSession, addToCartController);

// ✏️ Update quantity
cartRouter.put(
  "/cart/update",
  resolveCustomerSession,
  updateCartItemController,
);

// ❌ Remove item
cartRouter.delete(
  "/cart/item/:cartItemId",
  resolveCustomerSession,
  removeCartItemController,
);

// 🛒 Get cart
cartRouter.get("/cart", resolveCustomerSession, getCartController);

export default cartRouter;
