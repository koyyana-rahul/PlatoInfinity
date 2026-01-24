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
      { session: mongoSession },
    );

    // ✅ OCCUPY TABLE
    table.status = "OCCUPIED";
    await table.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    const io = req.app.locals.io;
    const populatedSession = await SessionModel.findById(
      sessionDoc[0]._id,
    ).populate(
      "tableId",
      "_id tableNumber name seatingCapacity status qrUrl qrImageUrl",
    );

    io.to(`restaurant:${restaurantId}`).emit(
      "session:opened",
      populatedSession,
    );

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

export async function listRestaurantSessionsController(req, res) {
  try {
    const user = req.user;
    const { restaurantId } = req.params;
    const { status = "OPEN" } = req.query;

    if (String(user.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({
        message: "Forbidden",
        error: true,
        success: false,
      });
    }

    const filter = {
      restaurantId,
    };

    if (status === "OPEN" || status === "CLOSED") {
      filter.status = status;
    }

    const sessions = await SessionModel.find(filter)
      .select(
        "_id restaurantId tableId openedByUserId tablePin status startedAt lastActivityAt closedAt",
      )
      .populate(
        "tableId",
        "_id tableNumber name seatingCapacity status qrUrl qrImageUrl",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      error: false,
      data: sessions,
    });
  } catch (err) {
    console.error("listRestaurantSessionsController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/* =========================================================
   2️⃣ CUSTOMER JOINS SESSION (PUBLIC)
   ========================================================= */

export async function joinSessionController(req, res) {
  try {
    let { tableId, tablePin } = req.body;

    if (!tableId || !tablePin) {
      return res.status(400).json({
        message: "tableId and tablePin required",
        success: false,
      });
    }

    tablePin = String(tablePin);

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return res.status(400).json({
        message: "Invalid tableId",
        success: false,
      });
    }

    /* ========== FIND OPEN SESSION ========== */
    const session = await SessionModel.findOne({
      tableId,
      status: "OPEN",
    });

    if (!session) {
      return res.status(400).json({
        message: "Table session not found or closed",
        success: false,
      });
    }

    /* ========== VERIFY PIN WITH RATE LIMITING ========== */
    const pinResult = await session.verifyPin(tablePin);

    if (!pinResult.success) {
      return res.status(401).json({
        message: pinResult.message,
        success: false,
        isBlocked: pinResult.isBlocked || false,
        attemptsLeft: pinResult.attemptsLeft || 0,
      });
    }

    /* ========== ✅ PIN VERIFIED: GENERATE CUSTOMER TOKEN ========== */
    const rawCustomerToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawCustomerToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    console.log("🎯 Generated customer token");
    console.log("📦 Token:", rawCustomerToken.substring(0, 20) + "...");
    console.log("📦 Token length:", rawCustomerToken.length);
    console.log("📦 Token hash:", tokenHash.substring(0, 20) + "...");

    // Store the token hash in customerTokens array
    session.customerTokens = session.customerTokens || [];
    session.customerTokens.push({
      tokenHash,
      expiresAt,
      lastActivityAt: new Date(),
    });

    session.lastActivityAt = new Date();
    await session.save();

    // ✅ RETURN RAW TOKEN TO CLIENT
    const responseData = {
      sessionId: session._id,
      sessionToken: rawCustomerToken, // ✅ RAW TOKEN for client storage
      _timestamp: new Date().toISOString(), // DEBUG: Track which version is running
    };

    console.log("📤 Sending response:", {
      sessionId: responseData.sessionId,
      tokenLength: responseData.sessionToken.length,
      tokenStart: responseData.sessionToken.substring(0, 20) + "...",
    });

    return res.json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    console.error("joinSessionController:", err);
    return res.status(500).json({
      message: "Server error",
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
      { session: mongoSession },
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
      { session: mongoSession },
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

/* =========================================================
   6️⃣ RESUME SESSION AFTER COOKIE LOSS
   ========================================================= */
export async function resumeSessionController(req, res) {
  try {
    let { tableId, tablePin, restaurantId } = req.body;

    if (!tableId || !tablePin) {
      return res.status(400).json({
        message: "tableId and tablePin required",
        success: false,
      });
    }

    tablePin = String(tablePin);

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return res.status(400).json({
        message: "Invalid tableId",
        success: false,
      });
    }

    /* ========== FIND OPEN SESSION ========== */
    const session = await SessionModel.findOne({
      tableId,
      status: "OPEN",
    });

    if (!session) {
      return res.status(400).json({
        message: "Table session not found or closed",
        success: false,
      });
    }

    /* ========== VERIFY PIN WITH RATE LIMITING ========== */
    const pinResult = await session.verifyPin(tablePin);

    if (!pinResult.success) {
      return res.status(401).json({
        message: pinResult.message,
        success: false,
        isBlocked: pinResult.isBlocked || false,
        attemptsLeft: pinResult.attemptsLeft || 0,
      });
    }

    /* ========== ✅ PIN VERIFIED: GENERATE CUSTOMER TOKEN ========== */
    const rawCustomerToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawCustomerToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    // Store the token hash in customerTokens array
    session.customerTokens = session.customerTokens || [];
    session.customerTokens.push({
      tokenHash,
      expiresAt,
      lastActivityAt: new Date(),
    });

    session.lastActivityAt = new Date();
    await session.save();

    // ✅ RETURN RAW TOKEN TO CLIENT
    const responseData = {
      sessionId: session._id,
      sessionToken: rawCustomerToken,
      mode: session.mode || "INDIVIDUAL",
    };

    return res.json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    console.error("resumeSessionController:", err);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}

/* =========================================================
   7️⃣ CHECK TOKEN EXPIRY
   ========================================================= */
export async function checkTokenExpiryController(req, res) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "sessionId required",
        success: false,
      });
    }

    const session = await SessionModel.findOne({
      _id: sessionId,
      status: "OPEN",
    });

    if (!session) {
      return res.status(401).json({
        message: "Session not found or expired",
        success: false,
        expired: true,
      });
    }

    // Get the raw token from headers
    const rawToken =
      req.headers["x-customer-session"] || req.headers["x-session-token"];

    if (!rawToken) {
      return res.status(401).json({
        message: "No token provided",
        success: false,
      });
    }

    const tokenHash = hashToken(rawToken);

    // Check if token exists and is valid
    const validToken = session.customerTokens?.find(
      (t) => t.tokenHash === tokenHash && t.expiresAt > new Date(),
    );

    if (!validToken) {
      return res.status(401).json({
        message: "Token expired or invalid",
        success: false,
        expired: true,
      });
    }

    // Update last activity
    session.lastActivityAt = new Date();
    await session.save();

    return res.json({
      success: true,
      expired: false,
      expiresAt: validToken.expiresAt,
    });
  } catch (err) {
    console.error("checkTokenExpiryController:", err);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}

/* =========================================================
   8️⃣ GET SESSION STATUS
   ========================================================= */
export async function getSessionStatusController(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await SessionModel.findById(sessionId).select(
      "_id status tableId restaurantId mode lastActivityAt",
    );

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
        success: false,
      });
    }

    return res.json({
      success: true,
      data: {
        sessionId: session._id,
        status: session.status,
        tableId: session.tableId,
        restaurantId: session.restaurantId,
        mode: session.mode || "INDIVIDUAL",
        lastActivityAt: session.lastActivityAt,
      },
    });
  } catch (err) {
    console.error("getSessionStatusController:", err);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
}
