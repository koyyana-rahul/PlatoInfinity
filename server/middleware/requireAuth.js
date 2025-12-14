// src/middleware/requireAuth.js
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

/**
 * requireAuth middleware
 * - Reads access token from cookie `accessToken` OR Authorization header `Bearer <token>`
 * - Verifies JWT using JWT access secret (prefers JWT_SECRET_ACCESS, fallback to JWT_SECRET)
 * - Loads user (minimal projection) into req.user and req.userId
 *
 * NOTE: This middleware expects the access tokens to be signed with the access secret.
 */
export async function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.accessToken;
    const header = req.headers?.authorization;
    const headerToken =
      header && typeof header === "string" && header.startsWith("Bearer ")
        ? header.split(" ")[1]
        : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - token missing",
        error: true,
        success: false,
      });
    }

    // Prefer explicit access secret (used by controllers). Fallback to JWT_SECRET for compatibility.
    const accessSecret =
      process.env.JWT_SECRET_ACCESS || process.env.JWT_SECRET;
    if (!accessSecret) {
      console.error("requireAuth: missing JWT_SECRET_ACCESS/JWT_SECRET env");
      return res.status(500).json({
        message: "Server misconfiguration (JWT secret missing)",
        error: true,
        success: false,
      });
    }

    let payload;
    try {
      // verify throws if invalid/expired
      payload = jwt.verify(token, accessSecret);
    } catch (err) {
      // token invalid or expired
      return res.status(401).json({
        message: "Invalid or expired token",
        error: true,
        success: false,
      });
    }

    // Accept common payload shapes: { sub }, { _id }, { id }
    const userId = payload?.sub || payload?._id || payload?.id;
    if (!userId) {
      return res.status(401).json({
        message: "Invalid token payload",
        error: true,
        success: false,
      });
    }

    // Load user with minimal fields to avoid leaking sensitive info and reduce payload size.
    const user = await UserModel.findById(userId, {
      password: 0,
      refresh_token: 0,
      forgot_password_otp: 0,
      forgot_password_expiry: 0,
    }).lean();

    if (!user) {
      return res.status(401).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // attach to request
    req.userId = user._id;
    req.user = user;

    return next();
  } catch (err) {
    console.error("requireAuth error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

export default requireAuth;
