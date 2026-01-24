/**
 * idempotency.service.js
 *
 * Prevents duplicate orders from being created when customers click "Place Order" multiple times
 * or when network requests are retried.
 *
 * Flow:
 * 1. Client generates idempotencyKey (UUID) before order placement
 * 2. Server stores key with order result
 * 3. If same key received again, return cached result instead of creating new order
 * 4. Keys expire after 24 hours
 */

import IdempotencyKey from "../models/idempotencyKey.model.js";

const IDEMPOTENCY_TTL_HOURS = 24;

/* ========== CHECK IDEMPOTENCY ========== */
/**
 * Returns { isNew: true, orderId: null } if first request
 * Returns { isNew: false, orderId: "...", orderData: {...} } if duplicate
 */
export async function checkIdempotency(idempotencyKey) {
  try {
    const record = await IdempotencyKey.findOne({
      idempotencyKey,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (record) {
      console.log(
        `🔄 IDEMPOTENT: Returning cached result for key ${idempotencyKey.substring(0, 8)}...`,
      );
      return {
        isNew: false,
        orderId: record.orderId,
        orderData: record.responseData,
      };
    }

    return { isNew: true, orderId: null, orderData: null };
  } catch (err) {
    console.error("❌ Idempotency check failed:", err);
    // If check fails, treat as new request (fail-open)
    return { isNew: true, orderId: null, orderData: null };
  }
}

/* ========== STORE IDEMPOTENCY RESULT ========== */
export async function storeIdempotencyResult(
  idempotencyKey,
  orderId,
  responseData = {},
) {
  try {
    const expiresAt = new Date(
      Date.now() + IDEMPOTENCY_TTL_HOURS * 60 * 60 * 1000,
    );

    await IdempotencyKey.create({
      idempotencyKey,
      orderId,
      responseData,
      expiresAt,
    });

    console.log(
      `✅ IDEMPOTENCY STORED: Key ${idempotencyKey.substring(0, 8)}... → Order ${orderId}`,
    );
  } catch (err) {
    // Log but don't throw - idempotency caching is best-effort
    console.error(
      "⚠️ Failed to store idempotency result (non-critical):",
      err.message,
    );
  }
}

/* ========== MIDDLEWARE: Require idempotency key ========== */
export function requireIdempotencyKey(req, res, next) {
  const idempotencyKey =
    req.headers["idempotency-key"] || req.body?.idempotencyKey;

  if (!idempotencyKey) {
    return res.status(400).json({
      success: false,
      message:
        "idempotencyKey required in headers or body to prevent duplicate orders",
    });
  }

  // Validate format (UUID)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(idempotencyKey)) {
    return res.status(400).json({
      success: false,
      message: "idempotencyKey must be a valid UUID v4",
    });
  }

  req.idempotencyKey = idempotencyKey;
  next();
}

export default {
  checkIdempotency,
  storeIdempotencyResult,
  requireIdempotencyKey,
  IDEMPOTENCY_TTL_HOURS,
};
