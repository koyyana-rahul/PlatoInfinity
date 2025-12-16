import mongoose from "mongoose";
import CartItem from "../models/cartItem.model.js";
import BranchMenuItem from "../models/branchMenuItem.model.js";

/**
 * CONSTANTS (business rules)
 */
const MAX_QTY_PER_ITEM = 20;

/**
 * ADD ITEM TO CART
 * POST /api/cart/add
 */
export async function addToCartController(req, res) {
  const session = req.sessionDoc;
  const { branchMenuItemId, quantity = 1 } = req.body;

  try {
    // 🔐 Session safety
    if (!session || session.status !== "OPEN") {
      return res.status(403).json({
        message: "Session closed. Cannot modify cart.",
        error: true,
        success: false,
      });
    }

    if (!branchMenuItemId || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      return res.status(400).json({
        message: "Invalid item or quantity",
        error: true,
        success: false,
      });
    }

    // 🔍 Validate menu item
    const menuItem = await BranchMenuItem.findOne({
      _id: branchMenuItemId,
      restaurantId: session.restaurantId,
      status: "ON",
      isArchived: false,
    }).lean();

    if (!menuItem) {
      return res.status(400).json({
        message: "Item unavailable",
        error: true,
        success: false,
      });
    }

    // 📦 Stock check
    if (
      menuItem.trackStock &&
      typeof menuItem.stock === "number" &&
      menuItem.stock < quantity
    ) {
      return res.status(400).json({
        message: "Insufficient stock",
        error: true,
        success: false,
      });
    }

    // 🧠 SNAPSHOT PRICE (important)
    const cartItem = await CartItem.findOneAndUpdate(
      {
        sessionId: session._id,
        branchMenuItemId,
      },
      {
        $setOnInsert: {
          restaurantId: session.restaurantId,
          sessionId: session._id,
          branchMenuItemId,
          name: menuItem.name,
          price: menuItem.price, // snapshot
          station: menuItem.station,
          taxPercent: menuItem.taxPercent || 0,
        },
        $inc: { quantity },
      },
      { upsert: true, new: true }
    );

    // ⛔ Enforce max qty
    if (cartItem.quantity > MAX_QTY_PER_ITEM) {
      cartItem.quantity = MAX_QTY_PER_ITEM;
      await cartItem.save();
    }

    return res.json({
      success: true,
      error: false,
      data: cartItem,
    });
  } catch (err) {
    console.error("addToCartController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * UPDATE CART ITEM QTY
 * PUT /api/cart/update
 */
export async function updateCartItemController(req, res) {
  const session = req.sessionDoc;
  const { cartItemId, quantity } = req.body;

  try {
    if (!session || session.status !== "OPEN") {
      return res.status(403).json({
        message: "Session closed",
        error: true,
        success: false,
      });
    }

    if (!cartItemId || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      return res.status(400).json({
        message: "Invalid cart item or quantity",
        error: true,
        success: false,
      });
    }

    const cartItem = await CartItem.findOne({
      _id: cartItemId,
      sessionId: session._id,
    });

    if (!cartItem) {
      return res.status(404).json({
        message: "Cart item not found",
        error: true,
        success: false,
      });
    }

    // Recheck stock
    const menuItem = await BranchMenuItem.findById(
      cartItem.branchMenuItemId
    ).lean();

    if (
      menuItem?.trackStock &&
      typeof menuItem.stock === "number" &&
      menuItem.stock < quantity
    ) {
      return res.status(400).json({
        message: "Insufficient stock",
        error: true,
        success: false,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return res.json({
      success: true,
      error: false,
      data: cartItem,
    });
  } catch (err) {
    console.error("updateCartItemController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * REMOVE CART ITEM
 * DELETE /api/cart/item/:cartItemId
 */
export async function removeCartItemController(req, res) {
  const session = req.sessionDoc;
  const { cartItemId } = req.params;

  try {
    if (!session || session.status !== "OPEN") {
      return res.status(403).json({
        message: "Session closed",
        error: true,
        success: false,
      });
    }

    await CartItem.deleteOne({
      _id: cartItemId,
      sessionId: session._id,
    });

    return res.json({
      success: true,
      error: false,
      message: "Item removed",
    });
  } catch (err) {
    console.error("removeCartItemController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * GET CART
 * GET /api/cart
 */
export async function getCartController(req, res) {
  const session = req.sessionDoc;

  try {
    const items = await CartItem.find({
      sessionId: session._id,
    }).sort({ createdAt: 1 });

    let subtotal = 0;
    let taxTotal = 0;

    items.forEach((i) => {
      const itemTotal = i.price * i.quantity;
      subtotal += itemTotal;
      taxTotal += (itemTotal * (i.taxPercent || 0)) / 100;
    });

    return res.json({
      success: true,
      error: false,
      data: {
        items,
        subtotal,
        tax: taxTotal,
        totalAmount: subtotal + taxTotal,
      },
    });
  } catch (err) {
    console.error("getCartController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * INTERNAL – CLEAR CART (used after order placement)
 */
export async function clearCartBySession(sessionId, mongoSession = null) {
  if (!sessionId) return;
  await CartItem.deleteMany(
    { sessionId },
    mongoSession ? { session: mongoSession } : {}
  );
}
