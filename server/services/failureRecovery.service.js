/**
 * failureRecovery.service.js
 *
 * Handles all failure scenarios gracefully:
 * 1. Cookie cleared → Session resume with PIN
 * 2. Phone dies → Session resumes with same token
 * 3. Network failure during order → Can retry/resume
 * 4. Token expires → Refresh with PIN
 * 5. Table changed → Migrate session to new table
 * 6. Concurrent requests → Idempotency prevents duplicates
 */

import SessionModel from "../models/session.model.js";
import CartItemModel from "../models/cartItem.model.js";
import OrderModel from "../models/order.model.js";

/* ========== RESUME SESSION AFTER COOKIE LOSS ========== */
/**
 * Customer cleared cookies or opened on new device
 * Can resume with PIN without losing cart/orders
 */
export async function resumeSessionAfterCookieLoss({
  tableId,
  tablePin,
  restaurantId,
}) {
  try {
    // Find the OPEN session for this table
    const session = await SessionModel.findOne({
      tableId,
      status: "OPEN",
      restaurantId,
    });

    if (!session) {
      return {
        success: false,
        message: "Session not found",
        code: "SESSION_NOT_FOUND",
      };
    }

    // Verify PIN
    const pinResult = await session.verifyPin(tablePin);
    if (!pinResult.success) {
      return {
        success: false,
        message: pinResult.message,
        isBlocked: pinResult.isBlocked,
      };
    }

    // Generate new token for this device
    const crypto = await import("crypto").then((m) => m.default);
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    session.customerTokens.push({
      tokenHash,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      lastActivityAt: new Date(),
    });

    await session.save();

    // Get current cart
    const cart = await CartItemModel.find({
      sessionId: session._id,
    }).lean();

    // Get current orders
    const orders = await OrderModel.find({
      sessionId: session._id,
      orderStatus: { $ne: "CANCELLED" },
    }).lean();

    return {
      success: true,
      sessionId: session._id,
      sessionToken: rawToken,
      mode: session.mode,
      cartItemCount: cart.length,
      orderCount: orders.length,
      message: "Session resumed. Your cart and orders are safe.",
    };
  } catch (err) {
    console.error("❌ Resume session failed:", err);
    throw err;
  }
}

/* ========== DETECT SESSION TIMEOUT ========== */
export async function checkSessionTokenExpiry(sessionId, rawToken) {
  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      return {
        expired: true,
        message: "Session not found",
        requiresRepin: true,
      };
    }

    if (session.status !== "OPEN") {
      return {
        expired: true,
        message: "Session closed",
        requiresRepin: false,
      };
    }

    // Check if token exists and is valid
    const crypto = await import("crypto").then((m) => m.default);
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const tokenRecord = session.customerTokens.find(
      (t) => t.tokenHash === tokenHash && t.expiresAt > new Date(),
    );

    if (!tokenRecord) {
      return {
        expired: true,
        message: "Token expired or invalid",
        requiresRepin: true,
      };
    }

    // Check if session itself is too old (8 hours)
    const sessionAge = (Date.now() - session.startedAt) / 1000 / 60 / 60;
    if (sessionAge > 8) {
      return {
        expired: true,
        message: "Session expired",
        requiresRepin: true,
      };
    }

    return {
      expired: false,
      valid: true,
    };
  } catch (err) {
    console.error("Token expiry check failed:", err);
    return {
      expired: true,
      message: "Error checking token",
      requiresRepin: true,
    };
  }
}

/* ========== HANDLE TABLE CHANGE MID-SESSION ========== */
export async function migrateSessionToNewTable({
  sessionId,
  newTableId,
  movedByUserId,
}) {
  try {
    const session = await SessionModel.findById(sessionId);
    if (!session || session.status !== "OPEN") {
      throw new Error("Session not found or closed");
    }

    const oldTableId = session.tableId;
    session.currentTableId = newTableId;
    session.lastActivityAt = new Date();

    // Store migration info in meta
    session.meta = session.meta || {};
    session.meta.migrations = session.meta.migrations || [];
    session.meta.migrations.push({
      fromTable: oldTableId,
      toTable: newTableId,
      timestamp: new Date(),
      movedBy: movedByUserId,
    });

    await session.save();

    return {
      success: true,
      message: "Session migrated to new table",
      sessionId: session._id,
      newTableId,
      oldTableId,
    };
  } catch (err) {
    console.error("❌ Table migration failed:", err);
    throw err;
  }
}

/* ========== RETRY FAILED ORDER PLACEMENT ========== */
export async function retryFailedOrderPlacement({
  sessionId,
  restaurantId,
  idempotencyKey,
}) {
  try {
    // Check if order was already created
    const existingOrder = await OrderModel.findOne({
      sessionId,
      clientRequestId: idempotencyKey,
    });

    if (existingOrder) {
      return {
        success: true,
        alreadyCreated: true,
        orderId: existingOrder._id,
        message: "Order was already placed",
      };
    }

    // Check cart status
    const cart = await CartItemModel.find({
      sessionId,
      restaurantId,
    }).lean();

    if (!cart.length) {
      return {
        success: false,
        message: "Cart is empty. Nothing to order.",
      };
    }

    return {
      success: true,
      alreadyCreated: false,
      readyToRetry: true,
      cartItemCount: cart.length,
      message: "Cart intact. Ready to retry order placement.",
    };
  } catch (err) {
    console.error("❌ Retry check failed:", err);
    throw err;
  }
}

/* ========== HANDLE CONCURRENT REQUESTS ========== */
/**
 * Prevent race conditions when customer has multiple tabs/devices
 * In INDIVIDUAL mode, each device has separate cart
 * In FAMILY mode, enforce single checkout at a time
 */
export async function enforceCheckoutExclusivity({
  sessionId,
  mode,
  deviceId,
}) {
  try {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    if (session.mode === "INDIVIDUAL") {
      // Each device can check out independently - no blocking needed
      return { canCheckout: true, message: "Independent checkout allowed" };
    }

    if (session.mode === "FAMILY") {
      // In FAMILY mode, store checkout device to prevent concurrent checkouts
      const checkoutInProgress = session.meta?.checkoutDeviceId;
      if (checkoutInProgress && checkoutInProgress !== deviceId) {
        return {
          canCheckout: false,
          message: "Another customer is checking out. Please wait.",
          checkoutDeviceId: checkoutInProgress,
        };
      }

      // Mark this device as checking out
      session.meta = session.meta || {};
      session.meta.checkoutDeviceId = deviceId;
      session.meta.checkoutStartedAt = new Date();
      await session.save();

      return {
        canCheckout: true,
        message: "Checkout started",
        isExclusive: true,
      };
    }
  } catch (err) {
    console.error("❌ Checkout exclusivity check failed:", err);
    throw err;
  }
}

/* ========== CLEAR CHECKOUT LOCK ========== */
export async function clearCheckoutLock(sessionId) {
  try {
    const session = await SessionModel.findById(sessionId);
    if (session) {
      session.meta = session.meta || {};
      session.meta.checkoutDeviceId = null;
      session.meta.checkoutStartedAt = null;
      await session.save();
    }
  } catch (err) {
    console.error("⚠️ Failed to clear checkout lock:", err);
    // Non-critical, don't throw
  }
}

export default {
  resumeSessionAfterCookieLoss,
  checkSessionTokenExpiry,
  migrateSessionToNewTable,
  retryFailedOrderPlacement,
  enforceCheckoutExclusivity,
  clearCheckoutLock,
};
