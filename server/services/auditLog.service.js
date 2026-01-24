/**
 * auditLog.service.js
 *
 * Centralized audit logging service for all sensitive actions:
 * - PIN entry attempts
 * - Session opens/closes
 * - Order placements
 * - Payments
 * - Table changes
 * - Staff actions
 *
 * Each log includes: userId, action, timestamp, IP, user agent, sessionId, details
 */

import AuditLog from "../models/auditLog.model.js";

/* ========== ACTION TYPES ========== */
const ACTION_TYPES = {
  // PIN & SESSION
  PIN_ATTEMPT: "PIN_ATTEMPT",
  PIN_VERIFIED: "PIN_VERIFIED",
  PIN_BLOCKED: "PIN_BLOCKED",
  SESSION_OPENED: "SESSION_OPENED",
  SESSION_CLOSED: "SESSION_CLOSED",
  SESSION_RESUMED: "SESSION_RESUMED",

  // ORDERS
  ORDER_PLACED: "ORDER_PLACED",
  ORDER_CONFIRMED: "ORDER_CONFIRMED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  ORDER_ITEM_STATUS_CHANGED: "ORDER_ITEM_STATUS_CHANGED",

  // PAYMENTS
  PAYMENT_INITIATED: "PAYMENT_INITIATED",
  PAYMENT_COMPLETED: "PAYMENT_COMPLETED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  REFUND_ISSUED: "REFUND_ISSUED",

  // CART
  CART_ITEM_ADDED: "CART_ITEM_ADDED",
  CART_ITEM_REMOVED: "CART_ITEM_REMOVED",
  CART_CLEARED: "CART_CLEARED",

  // TABLE
  TABLE_REASSIGNED: "TABLE_REASSIGNED",
  TABLE_MERGED: "TABLE_MERGED",
  TABLE_SPLIT: "TABLE_SPLIT",

  // STAFF
  STAFF_LOGIN: "STAFF_LOGIN",
  STAFF_LOGOUT: "STAFF_LOGOUT",
  STAFF_ACTION: "STAFF_ACTION",

  // SUSPICIOUS
  SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
  FRAUD_DETECTED: "FRAUD_DETECTED",
};

/* ========== HELPER: Extract client info ========== */
function getClientInfo(req) {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    "unknown";

  const userAgent = req.headers["user-agent"] || "unknown";

  return { ip, userAgent };
}

/* ========== MAIN AUDIT LOG FUNCTION ========== */
export async function createAuditLog({
  req,
  action,
  userId = null,
  sessionId = null,
  restaurantId = null,
  details = {},
  severity = "info", // 'info', 'warning', 'critical'
}) {
  try {
    const { ip, userAgent } = getClientInfo(req || {});

    const log = new AuditLog({
      action,
      userId,
      sessionId,
      restaurantId,
      ipAddress: ip,
      userAgent,
      details,
      severity,
      timestamp: new Date(),
    });

    await log.save();

    // Log to console with emoji indicator
    const severityEmoji =
      {
        info: "ℹ️",
        warning: "⚠️",
        critical: "🚨",
      }[severity] || "📝";

    console.log(
      `${severityEmoji} AUDIT: ${action} | User: ${userId || "GUEST"} | Session: ${sessionId ? sessionId.toString().substring(0, 8) : "N/A"}...`,
    );

    return log;
  } catch (err) {
    console.error("❌ Audit log creation failed:", err);
    // Don't throw - audit logging failures shouldn't break the application
    return null;
  }
}

/* ========== SPECIFIC AUDIT FUNCTIONS ========== */

export const auditFunctions = {
  /* PIN & SESSION */
  logPinAttempt: async (req, { sessionId, isCorrect, attemptsLeft }) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.PIN_ATTEMPT,
      sessionId,
      details: {
        isCorrect,
        attemptsLeft,
      },
      severity: isCorrect ? "info" : "warning",
    });
  },

  logPinVerified: async (req, { sessionId }) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.PIN_VERIFIED,
      sessionId,
      severity: "info",
    });
  },

  logPinBlocked: async (req, { sessionId, minutesLeft }) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.PIN_BLOCKED,
      sessionId,
      details: { minutesLeft },
      severity: "critical",
    });
  },

  logSessionOpened: async (req, { sessionId, restaurantId, tableId, mode }) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.SESSION_OPENED,
      sessionId,
      restaurantId,
      userId: req?.user?._id || null,
      details: { tableId, mode },
      severity: "info",
    });
  },

  logSessionClosed: async (
    req,
    { sessionId, restaurantId, closedByUserId },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.SESSION_CLOSED,
      sessionId,
      restaurantId,
      userId: closedByUserId,
      severity: "info",
    });
  },

  /* ORDERS */
  logOrderPlaced: async (
    req,
    { sessionId, orderId, restaurantId, amount, itemCount },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.ORDER_PLACED,
      sessionId,
      restaurantId,
      details: {
        orderId,
        amount,
        itemCount,
      },
      severity: "info",
    });
  },

  logOrderCancelled: async (
    req,
    { sessionId, orderId, restaurantId, reason },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.ORDER_CANCELLED,
      sessionId,
      restaurantId,
      userId: req?.user?._id || null,
      details: { orderId, reason },
      severity: "warning",
    });
  },

  /* PAYMENTS */
  logPaymentInitiated: async (
    req,
    { sessionId, restaurantId, amount, method },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.PAYMENT_INITIATED,
      sessionId,
      restaurantId,
      details: { amount, method },
      severity: "info",
    });
  },

  logPaymentCompleted: async (
    req,
    { sessionId, restaurantId, amount, method, reference },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.PAYMENT_COMPLETED,
      sessionId,
      restaurantId,
      details: { amount, method, reference },
      severity: "info",
    });
  },

  logPaymentFailed: async (
    req,
    { sessionId, restaurantId, amount, method, reason },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.PAYMENT_FAILED,
      sessionId,
      restaurantId,
      details: { amount, method, reason },
      severity: "warning",
    });
  },

  /* SUSPICIOUS ACTIVITY */
  logSuspiciousActivity: async (
    req,
    { sessionId, restaurantId, reason, details = {} },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.SUSPICIOUS_ACTIVITY,
      sessionId,
      restaurantId,
      details: { reason, ...details },
      severity: "critical",
    });
  },

  /* STAFF ACTIONS */
  logStaffLogin: async (req, { userId, staffId, restaurantId }) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.STAFF_LOGIN,
      userId: staffId,
      restaurantId,
      severity: "info",
    });
  },

  logStaffLogout: async (req, { userId, staffId, restaurantId }) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.STAFF_LOGOUT,
      userId: staffId,
      restaurantId,
      severity: "info",
    });
  },

  logStaffAction: async (
    req,
    { userId, restaurantId, actionDescription, details = {} },
  ) => {
    return createAuditLog({
      req,
      action: ACTION_TYPES.STAFF_ACTION,
      userId,
      restaurantId,
      details: { description: actionDescription, ...details },
      severity: "info",
    });
  },
};

export { ACTION_TYPES };
export default {
  createAuditLog,
  auditFunctions,
  ACTION_TYPES,
};
