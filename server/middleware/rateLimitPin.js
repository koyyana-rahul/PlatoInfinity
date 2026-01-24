/**
 * rateLimitPin.js
 *
 * Rate-limits PIN verification attempts at multiple levels:
 * 1. Per-session: 5 attempts per 15 minutes
 * 2. Per-IP: 50 attempts per hour (prevent distributed attacks)
 * 3. Global: Monitor suspicious patterns
 *
 * Implements exponential backoff and persistent blocking
 */

import rateLimit from "express-rate-limit";
import SessionModel from "../models/session.model.js";

/* ========== HELPER: Extract client IP ========== */
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    "unknown"
  );
}

/* ========== HELPER: Check session PIN blocking ========== */
export async function checkSessionPinBlocking(sessionId) {
  const session = await SessionModel.findById(sessionId).select(
    "pinBlockedUntil pinFailedCount",
  );

  if (!session) {
    return { blocked: false };
  }

  const isBlocked = session.isPinBlocked();

  if (isBlocked) {
    const minutesLeft = Math.ceil(
      (session.pinBlockedUntil - new Date()) / 1000 / 60,
    );
    return {
      blocked: true,
      minutesLeft,
      message: `Table PIN is blocked. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}`,
    };
  }

  return {
    blocked: false,
    attemptsRemaining: 5 - session.pinFailedCount,
  };
}

/* ========== IP-BASED RATE LIMIT (Global) ========== */
const ipRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 PIN attempts per hour per IP
  message: "Too many PIN attempts from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: (req, res) => {
    console.warn(
      `🚨 IP RATE LIMIT: ${getClientIp(req)} exceeded 50 attempts/hour`,
    );
    return res.status(429).json({
      success: false,
      message: "Too many PIN attempts. Please try again later.",
      retryAfter: 3600,
    });
  },
});

/* ========== SESSION-BASED RATE LIMIT (via DB) ========== */
export const sessionPinLimiter = async (req, res, next) => {
  try {
    const { sessionId, tableId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "sessionId required",
      });
    }

    // Check if session PIN is blocked
    const blockStatus = await checkSessionPinBlocking(sessionId);

    if (blockStatus.blocked) {
      console.warn(
        `⏳ SESSION PIN BLOCKED: Session ${sessionId} for ${blockStatus.minutesLeft} more minutes`,
      );
      return res.status(429).json({
        success: false,
        message: blockStatus.message,
        minutesLeft: blockStatus.minutesLeft,
        retryAfter: blockStatus.minutesLeft * 60,
      });
    }

    // Store block status in request for later use
    req.sessionPinStatus = blockStatus;

    // Continue to IP rate limiter
    return ipRateLimiter(req, res, next);
  } catch (err) {
    console.error("sessionPinLimiter error:", err);
    return next(err);
  }
};

/* ========== MIDDLEWARE CHAIN ========== */
export function requirePinRateLimit(req, res, next) {
  return sessionPinLimiter(req, res, next);
}

export default {
  sessionPinLimiter,
  requirePinRateLimit,
  checkSessionPinBlocking,
  getClientIp,
};
