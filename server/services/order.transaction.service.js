/**
 * order.transaction.service.js
 *
 * Handles atomic order placement using MongoDB transactions:
 * 1. Validate cart items
 * 2. Create order from cart (atomic transaction)
 * 3. Clear cart on success
 * 4. Rollback on any failure
 * 5. Handle network interruptions gracefully
 *
 * Ensures no orders are lost or duplicated, even on network failures
 */

import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";
import CartItemModel from "../models/cartItem.model.js";
import SessionModel from "../models/session.model.js";
import { storeIdempotencyResult } from "./idempotency.service.js";

/* ========== CREATE ORDER FROM CART (ATOMIC) ========== */
export async function createOrderFromCartTransaction({
  sessionId,
  restaurantId,
  tableId,
  tableName,
  paymentMethod = null,
  idempotencyKey = null,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* ========== 1. VALIDATE SESSION ========== */
    const sessionDoc = await SessionModel.findById(sessionId)
      .session(session)
      .select("status tableId restaurantId");

    if (!sessionDoc || sessionDoc.status !== "OPEN") {
      await session.abortTransaction();
      throw new Error("Session not found or already closed");
    }

    /* ========== 2. GET CART ITEMS ========== */
    const cartItems = await CartItemModel.find({
      sessionId,
      restaurantId,
    })
      .session(session)
      .lean();

    if (!cartItems || cartItems.length === 0) {
      await session.abortTransaction();
      throw new Error("Cart is empty");
    }

    /* ========== 3. CONVERT CART TO ORDER ITEMS ========== */
    const orderItems = cartItems.map((item) => ({
      branchMenuItemId: item.branchMenuItemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      station: item.station,
      selectedModifiers: item.selectedModifiers || [],
      itemStatus: "NEW",
    }));

    /* ========== 4. CREATE ORDER (ATOMIC) ========== */
    const order = new OrderModel({
      restaurantId,
      sessionId,
      tableId,
      tableName,
      items: orderItems,
      paymentMethod,
      orderStatus: "OPEN",
      clientRequestId: idempotencyKey, // For idempotency tracking
    });

    const savedOrder = await order.save({ session });

    /* ========== 5. CLEAR CART (ATOMIC) ========== */
    await CartItemModel.deleteMany(
      {
        sessionId,
        restaurantId,
      },
      { session },
    );

    /* ========== 6. UPDATE SESSION ========== */
    await SessionModel.updateOne(
      { _id: sessionId },
      { lastActivityAt: new Date() },
      { session },
    );

    /* ========== 7. COMMIT TRANSACTION ========== */
    await session.commitTransaction();

    console.log(
      `✅ ORDER CREATED ATOMICALLY: ${savedOrder._id} from ${cartItems.length} items`,
    );

    /* ========== 8. STORE IDEMPOTENCY RESULT ========== */
    if (idempotencyKey) {
      await storeIdempotencyResult(idempotencyKey, savedOrder._id, {
        orderId: savedOrder._id,
        totalAmount: savedOrder.totalAmount,
        itemCount: savedOrder.items.length,
      });
    }

    return {
      success: true,
      orderId: savedOrder._id,
      totalAmount: savedOrder.totalAmount,
      itemCount: savedOrder.items.length,
      orderData: savedOrder,
    };
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ ORDER TRANSACTION FAILED:", err.message);

    throw {
      success: false,
      message: err.message || "Failed to create order",
      code: "ORDER_TRANSACTION_FAILED",
    };
  } finally {
    session.endSession();
  }
}

/* ========== RESUME INTERRUPTED ORDER ========== */
/**
 * If network fails during order placement, this helps customer resume
 * without losing data or creating duplicates
 */
export async function resumeOrderPlacement({
  sessionId,
  restaurantId,
  idempotencyKey,
}) {
  try {
    // Check if order was already created with this idempotency key
    const existingOrder = await OrderModel.findOne({
      sessionId,
      clientRequestId: idempotencyKey,
    }).lean();

    if (existingOrder) {
      return {
        success: true,
        resumed: true,
        orderId: existingOrder._id,
        message: "Order already placed, resuming...",
      };
    }

    // Check if cart still exists
    const cartItems = await CartItemModel.find({
      sessionId,
      restaurantId,
    }).lean();

    if (!cartItems.length) {
      return {
        success: false,
        resumed: false,
        message: "Cart is empty. No order to resume.",
      };
    }

    return {
      success: true,
      resumed: false,
      message: "Ready to place order. Cart still intact.",
      itemCount: cartItems.length,
    };
  } catch (err) {
    console.error("Resume order placement failed:", err);
    throw err;
  }
}

export default {
  createOrderFromCartTransaction,
  resumeOrderPlacement,
};
