import crypto from "crypto";
import mongoose from "mongoose";
import TableModel from "../models/table.model.js";
import SessionModel from "../models/session.model.js";
import OrderModel from "../models/order.model.js";
import AuditLog from "../models/auditLog.model.js";

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

/* ---------------- HELPERS ---------------- */

function generatePin(length = 4) {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/* =========================================================
   1️⃣ OPEN TABLE SESSION (WAITER / MANAGER)
   ========================================================= */
export async function openTableSessionController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const user = req.user;
    const { restaurantId } = req.params;
    const { tableId } = req.body;

    if (!tableId)
      return res.status(400).json({
        message: "tableId required",
        error: true,
        success: false,
      });

    if (String(user.restaurantId) !== String(restaurantId))
      return res.status(403).json({
        message: "Forbidden",
        error: true,
        success: false,
      });

    // 🔒 Lock table
    const table = await TableModel.findOne({
      _id: tableId,
      restaurantId,
      status: "FREE",
    }).session(mongoSession);

    if (!table)
      return res.status(409).json({
        message: "Table not available",
        error: true,
        success: false,
      });

    const existingSession = await SessionModel.findOne({
      restaurantId,
      tableId,
      status: "OPEN",
    }).session(mongoSession);

    if (existingSession)
      return res.status(409).json({
        message: "Session already open for this table",
        error: true,
        success: false,
      });

    const tablePin = generatePin();
    const rawToken = crypto.randomBytes(32).toString("hex");

    const sessionDoc = await SessionModel.create(
      [
        {
          restaurantId,
          tableId,
          openedByUserId: user._id,
          tablePin,
          sessionTokenHash: hashToken(rawToken),
          tokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
          status: "OPEN",
          meta: {
            tableHistory: [{ tableId, movedAt: new Date() }],
          },
        },
      ],
      { session: mongoSession }
    );

    // ✅ OCCUPY TABLE
    table.status = "OCCUPIED";
    await table.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    return res.status(201).json({
      success: true,
      error: false,
      data: {
        sessionId: sessionDoc[0]._id,
        tablePin,
        sessionToken: rawToken,
      },
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("openTableSessionController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  } finally {
    mongoSession.endSession();
  }
}

/* =========================================================
   2️⃣ CUSTOMER JOINS SESSION (PUBLIC)
   ========================================================= */

export async function joinSessionController(req, res) {
  try {
    const { restaurantId, tableId, tablePin } = req.body;

    if (!restaurantId || !tableId || !tablePin) {
      return res.status(400).json({
        message: "restaurantId, tableId, tablePin required",
        error: true,
        success: false,
      });
    }

    // 1️⃣ Find open session
    const session = await SessionModel.findOne({
      restaurantId,
      tableId,
      tablePin,
      status: "OPEN",
    });

    if (!session) {
      return res.status(400).json({
        message: "Invalid table or PIN",
        error: true,
        success: false,
      });
    }

    // 2️⃣ Generate secure token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    session.sessionTokenHash = tokenHash;
    session.tokenExpiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    session.lastActivityAt = new Date();
    await session.save();

    // 3️⃣ STORE TOKEN IN COOKIE (KEY CHANGE 🔥)
    res.cookie("sessionToken", rawToken, {
      httpOnly: true, // ❌ JS can’t access
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: TOKEN_TTL_MS,
    });

    // 4️⃣ Return SAFE response
    return res.json({
      success: true,
      error: false,
      data: {
        sessionId: session._id,
      },
    });
  } catch (err) {
    console.error("joinSessionController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/* =========================================================
   3️⃣ SHIFT TABLE MID-SESSION
   ========================================================= */
export async function shiftTableController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const user = req.user;
    const { restaurantId, sessionId } = req.params;
    const { toTableId } = req.body;

    const sessionDoc = await SessionModel.findOne({
      _id: sessionId,
      restaurantId,
      status: "OPEN",
    }).session(mongoSession);

    if (!sessionDoc)
      return res.status(404).json({
        message: "Session not found",
        error: true,
        success: false,
      });

    const newTable = await TableModel.findOne({
      _id: toTableId,
      restaurantId,
      status: "FREE",
    }).session(mongoSession);

    if (!newTable)
      return res.status(409).json({
        message: "Target table not available",
        error: true,
        success: false,
      });

    // FREE OLD TABLE
    await TableModel.findByIdAndUpdate(
      sessionDoc.tableId,
      { status: "FREE" },
      { session: mongoSession }
    );

    // OCCUPY NEW TABLE
    newTable.status = "OCCUPIED";
    await newTable.save({ session: mongoSession });

    sessionDoc.tableId = toTableId;
    sessionDoc.meta.tableHistory.push({
      tableId: toTableId,
      movedAt: new Date(),
      movedBy: user._id,
    });
    await sessionDoc.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    return res.json({
      success: true,
      error: false,
      message: "Table shifted",
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("shiftTableController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  } finally {
    mongoSession.endSession();
  }
}

/* =========================================================
   4️⃣ CLOSE SESSION (BILL PAID)
   ========================================================= */
export async function closeSessionController(req, res) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { restaurantId, sessionId } = req.params;

    const sessionDoc = await SessionModel.findOne({
      _id: sessionId,
      restaurantId,
      status: "OPEN",
    }).session(mongoSession);

    if (!sessionDoc)
      return res.status(404).json({
        message: "Session not found",
        error: true,
        success: false,
      });

    const unpaidOrders = await OrderModel.countDocuments({
      sessionId,
      orderStatus: { $ne: "PAID" },
    });

    if (unpaidOrders > 0)
      return res.status(400).json({
        message: "Unpaid orders exist",
        error: true,
        success: false,
      });

    sessionDoc.status = "CLOSED";
    sessionDoc.closedAt = new Date();
    await sessionDoc.save({ session: mongoSession });

    await TableModel.findByIdAndUpdate(
      sessionDoc.tableId,
      { status: "FREE" },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();

    res.clearCookie("sessionToken");

    return res.json({
      success: true,
      error: false,
      message: "Session closed",
    });
  } catch (err) {
    await mongoSession.abortTransaction();
    console.error("closeSessionController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  } finally {
    mongoSession.endSession();
  }
}

/* =========================================================
   5️⃣ GET SESSION (WAITER / MANAGER)
   ========================================================= */
export async function getSessionController(req, res) {
  try {
    const { restaurantId, sessionId } = req.params;

    const session = await SessionModel.findOne({
      _id: sessionId,
      restaurantId,
    }).lean();

    if (!session)
      return res.status(404).json({
        message: "Session not found",
        error: true,
        success: false,
      });

    return res.json({
      success: true,
      error: false,
      data: session,
    });
  } catch (err) {
    console.error("getSessionController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
