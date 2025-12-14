// src/controllers/session.controller.js
import crypto from "crypto";
import mongoose from "mongoose";
import TableModel from "../models/table.model.js";
import SessionModel from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js"; // optional
import OrderModel from "../models/order.model.js"; // used for close checks

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function generatePin(length = 4) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Waiter opens a session for a table.
 * POST /restaurants/:restaurantId/sessions/open
 * Body: { tableId }
 * Auth: requireAuth + requireRole('WAITER','MANAGER')
 */
export async function openTableSessionController(req, res) {
  try {
    const user = req.user;
    const { restaurantId } = req.params;
    const { tableId } = req.body;

    if (!tableId)
      return res
        .status(400)
        .json({ message: "tableId required", error: true, success: false });
    if (!user || String(user.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    // ensure table exists and is part of restaurant
    const table = await TableModel.findOne({
      _id: tableId,
      restaurantId,
    }).lean();
    if (!table)
      return res
        .status(404)
        .json({ message: "Table not found", error: true, success: false });

    // ensure no open session on this table (or decide policy: allow multiple)
    const existingOpen = await SessionModel.findOne({
      restaurantId,
      tableId,
      status: "OPEN",
    }).lean();
    if (existingOpen)
      return res
        .status(409)
        .json({
          message: "Table already has an open session",
          error: true,
          success: false,
        });

    // generate a tablePin (4-digit) and session token raw
    const tablePin = generatePin(4);

    // create session record with only token hash stored and return raw sessionToken to waiter (they'll share PIN with customers)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const tokenExpiry = new Date(Date.now() + TOKEN_TTL_MS);

    const sessionDoc = await SessionModel.create({
      restaurantId,
      tableId,
      tableNumber: table.tableNumber || null,
      openedByWaiterId: user._id,
      tablePin,
      status: "OPEN",
      sessionTokenHash: tokenHash,
      tokenExpiresAt: tokenExpiry,
      meta: {
        currentTableHistory: [
          { tableId: tableId, movedAt: new Date(), movedBy: user._id },
        ],
      },
    });

    // Audit
    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(user._id),
        action: "OPEN_SESSION",
        entityType: "Session",
        entityId: String(sessionDoc._id),
        meta: { tableId },
      });
    } catch (e) {}

    // Return: sessionId, tablePin (for customer), sessionToken (raw) for waiter to store/use to print QR or attach to the table device
    return res.status(201).json({
      message: "Session opened",
      error: false,
      success: true,
      data: {
        sessionId: sessionDoc._id,
        tablePin: sessionDoc.tablePin,
        sessionToken: rawToken, // IMPORTANT: show raw only now — store hash server-side
        tokenExpiresAt: tokenExpiry,
      },
    });
  } catch (err) {
    console.error("openTableSessionController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * Customer joins session using tableId + tablePin.
 * POST /sessions/join
 * Body: { restaurantId, tableId, tablePin }
 * Returns short-lived sessionToken (raw) for the customer to use for placing orders, or sessionId if already in session.
 */
export async function joinSessionController(req, res) {
  try {
    const { restaurantId, tableId, tablePin } = req.body;
    if (!restaurantId || !tableId || !tablePin)
      return res
        .status(400)
        .json({
          message: "restaurantId, tableId, tablePin required",
          error: true,
          success: false,
        });

    // Find open session matching tableId, tablePin
    const session = await SessionModel.findOne({
      restaurantId,
      tableId,
      tablePin,
      status: "OPEN",
    });
    if (!session)
      return res
        .status(400)
        .json({
          message: "Wrong table or PIN or no open session",
          error: true,
          success: false,
        });

    // If token still valid and we want to return same token, we could return a new token to avoid giving the waiter token.
    // Generate a one-time raw token for the customer and store its hash (overwrites existing sessionTokenHash)
    const rawToken = crypto.randomBytes(28).toString("hex");
    const tokenHash = hashToken(rawToken);
    const tokenExpiry = new Date(Date.now() + TOKEN_TTL_MS);

    session.sessionTokenHash = tokenHash;
    session.tokenExpiresAt = tokenExpiry;
    // Optionally store lastJoinedAt and keep map of joined devices in meta
    session.meta = session.meta || {};
    session.meta.lastCustomerJoinedAt = new Date();
    await session.save();

    return res.json({
      message: "Joined session",
      error: false,
      success: true,
      data: {
        sessionId: session._id,
        sessionToken: rawToken,
        tokenExpiresAt: tokenExpiry,
      },
    });
  } catch (err) {
    console.error("joinSessionController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * Validate incoming session token (internal helper).
 * Use this in controllers that require a session token (orders etc).
 * Accept raw token (from header or body) and returns session doc if valid.
 */
export async function validateSessionToken(
  rawToken,
  sessionIdOrRestaurantAndTable = {}
) {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);

  // If sessionId provided prefer direct lookup
  if (sessionIdOrRestaurantAndTable.sessionId) {
    const s = await SessionModel.findOne({
      _id: sessionIdOrRestaurantAndTable.sessionId,
      sessionTokenHash: tokenHash,
      status: "OPEN",
    });
    if (!s) return null;
    if (s.tokenExpiresAt && new Date() > new Date(s.tokenExpiresAt))
      return null;
    return s;
  }

  // else use restaurantId + tableId lookup
  const { restaurantId, tableId } = sessionIdOrRestaurantAndTable;
  const q = { sessionTokenHash: tokenHash, status: "OPEN" };
  if (restaurantId) q.restaurantId = restaurantId;
  if (tableId) q.tableId = tableId;
  const s = await SessionModel.findOne(q).lean();
  if (!s) return null;
  if (s.tokenExpiresAt && new Date() > new Date(s.tokenExpiresAt)) return null;
  return s;
}

/**
 * Shift table mid-meal.
 * POST /restaurants/:restaurantId/sessions/:sessionId/shift
 * Body: { toTableId }
 * Auth: waiter (must be same restaurant)
 */
export async function shiftTableController(req, res) {
  try {
    const user = req.user;
    const { restaurantId, sessionId } = req.params;
    const { toTableId } = req.body;

    if (!toTableId)
      return res
        .status(400)
        .json({ message: "toTableId required", error: true, success: false });
    if (!user || String(user.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const session = await SessionModel.findOne({
      _id: sessionId,
      restaurantId,
      status: "OPEN",
    });
    if (!session)
      return res
        .status(404)
        .json({ message: "Session not found", error: true, success: false });

    const destTable = await TableModel.findOne({
      _id: toTableId,
      restaurantId,
    }).lean();
    if (!destTable)
      return res
        .status(404)
        .json({
          message: "Destination table not found",
          error: true,
          success: false,
        });

    // Make sure dest table has no open session or allow shift semantics
    const existingAtDest = await SessionModel.findOne({
      restaurantId,
      tableId: toTableId,
      status: "OPEN",
    }).lean();
    if (existingAtDest)
      return res
        .status(409)
        .json({
          message: "Destination table already has an open session",
          error: true,
          success: false,
        });

    // Update session currentTableHistory
    session.tableId = toTableId;
    session.tableNumber = destTable.tableNumber || null;
    session.meta = session.meta || {};
    session.meta.currentTableHistory = session.meta.currentTableHistory || [];
    session.meta.currentTableHistory.push({
      tableId: toTableId,
      movedAt: new Date(),
      movedBy: user._id,
    });
    await session.save();

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(user._id),
        action: "SHIFT_SESSION_TABLE",
        entityType: "Session",
        entityId: String(session._id),
        meta: { toTableId },
      });
    } catch (e) {}

    return res.json({
      message: "Session table shifted",
      error: false,
      success: true,
      data: { sessionId: session._id, currentTableId: toTableId },
    });
  } catch (err) {
    console.error("shiftTableController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * Close session (when bill paid and session can be closed)
 * POST /restaurants/:restaurantId/sessions/:sessionId/close
 * Body: { closedByWaiterId? } - typically current waiter closes
 */
export async function closeSessionController(req, res) {
  try {
    const user = req.user;
    const { restaurantId, sessionId } = req.params;

    if (!user || String(user.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const session = await SessionModel.findOne({
      _id: sessionId,
      restaurantId,
    });
    if (!session)
      return res
        .status(404)
        .json({ message: "Session not found", error: true, success: false });

    // Prevent closing if there are unpaid orders — optional: check order statuses
    const openOrders = await OrderModel.find({
      restaurantId,
      tableId: session.tableId,
      orderStatus: { $ne: "PAID" },
    }).lean();
    if (openOrders && openOrders.length > 0) {
      return res
        .status(400)
        .json({
          message: "Cannot close session: there are unpaid orders",
          error: true,
          success: false,
          data: { openOrdersCount: openOrders.length },
        });
    }

    session.status = "CLOSED";
    session.closedAt = new Date();
    await session.save();

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(user._id),
        action: "CLOSE_SESSION",
        entityType: "Session",
        entityId: String(session._id),
      });
    } catch (e) {}

    return res.json({
      message: "Session closed",
      error: false,
      success: true,
      data: { sessionId: session._id },
    });
  } catch (err) {
    console.error("closeSessionController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}

/**
 * Get session details (manager/waiter) - useful for UI
 * GET /restaurants/:restaurantId/sessions/:sessionId
 */
export async function getSessionController(req, res) {
  try {
    const user = req.user;
    const { restaurantId, sessionId } = req.params;
    if (!user || String(user.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const session = await SessionModel.findOne({
      _id: sessionId,
      restaurantId,
    }).lean();
    if (!session)
      return res
        .status(404)
        .json({ message: "Session not found", error: true, success: false });

    return res.json({
      message: "session",
      error: false,
      success: true,
      data: session,
    });
  } catch (err) {
    console.error("getSessionController err:", err);
    return res
      .status(500)
      .json({ message: "server error", error: true, success: false });
  }
}
