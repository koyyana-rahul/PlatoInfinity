import crypto from "crypto";
import mongoose from "mongoose";
import SessionModel from "../models/session.model.js";

/* ================= HELPERS ================= */

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function isObjectId(str) {
  return mongoose.Types.ObjectId.isValid(str) && str.length === 24;
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

    console.log("🔍 requireSessionAuth called");
    console.log(
      "📦 Token received:",
      rawToken ? rawToken.substring(0, 10) + "..." : "NONE",
    );
    console.log("📏 Token length:", rawToken?.length || 0);

    if (!rawToken) {
      console.log("❌ No token found in headers or cookies");
      return res.status(401).json({
        success: false,
        message: "Session token missing",
      });
    }

    /* ================= IDENTIFY TOKEN TYPE ================= */

    let session = null;
    const isObjectIdToken = isObjectId(rawToken);

    if (isObjectIdToken) {
      // 🔑 CASE 1: Token is ObjectId (24 chars) - OLD server returning sessionId
      console.log("🔑 Token is ObjectId format (sessionId)");

      session = await SessionModel.findOne({
        _id: rawToken,
        status: "OPEN",
      });

      if (session) {
        console.log("✅ Session found by ObjectId (old format)");
      } else {
        console.log("❌ No session found with this ObjectId");
      }
    } else {
      // 🔑 CASE 2: Token is 64-char crypto string or hash
      console.log("🔑 Token is crypto format (64 chars)");

      const tokenHash = hashToken(rawToken);
      console.log("🔐 Token hash:", tokenHash.substring(0, 10) + "...");

      // 🔑 CASE 2a: Try NEW customer token format first
      session = await SessionModel.findOne({
        status: "OPEN",
        customerTokens: {
          $elemMatch: {
            tokenHash,
            expiresAt: { $gt: new Date() },
          },
        },
      });

      if (session) {
        console.log("✅ Session found (NEW customerTokens format)");
      } else {
        console.log(
          "❌ Session NOT found with customerTokens, trying OLD format",
        );

        // 🔑 CASE 2b: Fallback to OLD sessionTokenHash format
        session = await SessionModel.findOne({
          status: "OPEN",
          sessionTokenHash: tokenHash,
          tokenExpiresAt: { $gt: new Date() },
        });

        if (session) {
          console.log("✅ Session found (OLD sessionTokenHash format)");
        }
      }
    }

    if (!session) {
      // Debug: show what sessions exist
      const allSessions = await SessionModel.find({ status: "OPEN" }).select(
        "_id customerTokens sessionTokenHash",
      );
      console.log(
        "📋 Available sessions:",
        allSessions.length,
        "| With NEW customerTokens:",
        allSessions.filter((s) => s.customerTokens?.length > 0).length,
        "| With OLD sessionTokenHash:",
        allSessions.filter((s) => s.sessionTokenHash).length,
      );

      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    /* ================= UPDATE TOKEN ACTIVITY ================= */

    if (session.customerTokens && session.customerTokens.length > 0) {
      // NEW format: update customerToken activity
      const tokenHash = hashToken(rawToken);
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
    } else {
      // OLD format: update session activity
      SessionModel.updateOne(
        {
          _id: session._id,
        },
        {
          $set: {
            lastActivityAt: new Date(),
          },
        },
      ).catch(() => {});
    }

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
