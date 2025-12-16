import crypto from "crypto";
import SessionModel from "../models/session.model.js";

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function requireSessionAuth(req, res, next) {
  try {
    // 1️⃣ Get token from COOKIE first (browser flow)
    const cookieToken = req.cookies?.sessionToken;

    // 2️⃣ Fallback to header (Postman / mobile apps)
    const headerToken =
      req.headers["x-session-token"] || req.headers["X-Session-Token"] || null;

    const rawToken = cookieToken || headerToken;

    if (!rawToken) {
      return res.status(401).json({
        message: "Session token missing",
        error: true,
        success: false,
      });
    }

    const tokenHash = hashToken(rawToken);

    // 3️⃣ Validate session
    const session = await SessionModel.findOne({
      sessionTokenHash: tokenHash,
      status: "OPEN",
      tokenExpiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        message: "Invalid or expired session",
        error: true,
        success: false,
      });
    }

    // 4️⃣ Attach session to request
    req.sessionDoc = session;
    req.sessionRawToken = rawToken;

    // 5️⃣ Update activity (non-blocking)
    SessionModel.updateOne(
      { _id: session._id },
      { lastActivityAt: new Date() }
    ).catch(() => {});

    return next();
  } catch (err) {
    console.error("requireSessionAuth error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export default requireSessionAuth;
