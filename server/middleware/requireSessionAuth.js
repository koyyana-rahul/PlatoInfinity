// src/middleware/requireSessionAuth.js
import crypto from "crypto";
import SessionModel from "../models/session.model.js";

/**
 * requireSessionAuth middleware
 * - looks for raw token in:
 *    1) Authorization header: "Bearer <token>"
 *    2) req.body.sessionToken
 *    3) req.query.sessionToken
 * - (optional) accepts req.body.sessionId or req.query.sessionId to ensure token belongs to that session
 *
 * After validation attaches:
 *   req.sessionDoc = <session doc from DB>
 *
 * On failure responds with 401/400 and a JSON error.
 */
function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export default function requireSessionAuth(options = {}) {
  // options: { allowExpired: false } (rarely used)
  const allowExpired = !!options.allowExpired;

  return async function (req, res, next) {
    try {
      // get token
      let rawToken = null;
      // Authorization header
      const authHeader = req.headers?.authorization;
      if (
        authHeader &&
        typeof authHeader === "string" &&
        authHeader.startsWith("Bearer ")
      ) {
        rawToken = authHeader.split(" ")[1].trim();
      }
      // body/query fallback
      if (!rawToken && req.body?.sessionToken) rawToken = req.body.sessionToken;
      if (!rawToken && req.query?.sessionToken)
        rawToken = req.query.sessionToken;

      if (!rawToken) {
        return res.status(401).json({
          message: "Session token required",
          error: true,
          success: false,
        });
      }

      const tokenHash = hashToken(rawToken);

      // Optionally accept a sessionId and prefer lookup by id+hash (safer)
      const sessionId =
        req.body?.sessionId ||
        req.query?.sessionId ||
        req.params?.sessionId ||
        null;

      let sessionQuery = { sessionTokenHash: tokenHash, status: "OPEN" };
      if (sessionId) sessionQuery._id = sessionId;

      const sessionDoc = await SessionModel.findOne(sessionQuery).lean();

      if (!sessionDoc) {
        return res.status(401).json({
          message: "Invalid or expired session token",
          error: true,
          success: false,
        });
      }

      // check expiry
      if (
        !allowExpired &&
        sessionDoc.tokenExpiresAt &&
        new Date() > new Date(sessionDoc.tokenExpiresAt)
      ) {
        return res.status(401).json({
          message: "Session token expired",
          error: true,
          success: false,
        });
      }

      // attach to request for downstream controllers/services
      req.sessionDoc = sessionDoc;
      req.sessionRawToken = rawToken; // in case downstream needs to rotate/inspect
      return next();
    } catch (err) {
      console.error("requireSessionAuth error:", err);
      return res.status(500).json({
        message: "Server error validating session token",
        error: true,
        success: false,
      });
    }
  };
}
