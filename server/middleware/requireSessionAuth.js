import crypto from "crypto";
import SessionModel from "../models/session.model.js";

/* ================= HELPERS ================= */

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/* ================= MIDDLEWARE ================= */

export async function requireSessionAuth(req, res, next) {
  try {
    /* ================= GET TOKEN ================= */

    // Node.js lowercases all headers
    const headerSessionToken = req.headers["x-session-token"];
    const headerCustomerToken = req.headers["x-customer-session"];
    const cookieToken = req.cookies?.sessionToken;

    const rawToken = headerSessionToken || headerCustomerToken || cookieToken;

    if (!rawToken) {
      return res.status(401).json({
        success: false,
        message: "Session token missing",
      });
    }

    const tokenHash = hashToken(rawToken);

    /* ================= FIND SESSION ================= */

    const session = await SessionModel.findOne({
      status: "OPEN",
      customerTokens: {
        $elemMatch: {
          tokenHash,
          expiresAt: { $gt: new Date() },
        },
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    /* ================= UPDATE TOKEN ACTIVITY ================= */

    SessionModel.updateOne(
      {
        _id: session._id,
        "customerTokens.tokenHash": tokenHash,
      },
      {
        $set: {
          "customerTokens.$.lastActivityAt": new Date(),
          lastActivityAt: new Date(),
        },
      },
    ).catch(() => {});

    /* ================= ATTACH TO REQUEST ================= */

    req.sessionDoc = session;
    req.sessionId = session._id;
    req.sessionToken = rawToken;

    return next();
  } catch (err) {
    console.error("❌ requireSessionAuth error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export default requireSessionAuth;
