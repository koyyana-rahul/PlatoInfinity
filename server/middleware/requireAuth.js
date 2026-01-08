// src/middleware/requireAuth.js
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

export async function requireAuth(req, res, next) {
  try {
    // 1️⃣ Read token from cookie or Authorization header
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

    // 2️⃣ Verify JWT
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT secret missing");
      return res.status(500).json({
        message: "Server misconfiguration",
        error: true,
        success: false,
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
        error: true,
        success: false,
      });
    }

    // 3️⃣ Extract userId
    const userId = payload.sub || payload._id || payload.id;
    if (!userId) {
      return res.status(401).json({
        message: "Invalid token payload",
        error: true,
        success: false,
      });
    }

    // 4️⃣ Load user (ADMIN / MANAGER / WAITER / CHEF)
    const user = await UserModel.findById(userId)
      .select("_id name role restaurantId brandId isActive")
      .lean();

    if (!user || user.isActive === false) {
      return res.status(401).json({
        message: "User not found or inactive",
        error: true,
        success: false,
      });
    }

    // 5️⃣ Normalize auth context (VERY IMPORTANT)
    req.userId = user._id;
    req.user = {
      _id: user._id,
      name: user.name,
      role: user.role, // BRAND_ADMIN / MANAGER / WAITER / CHEF
      restaurantId: user.restaurantId || null,
      brandId: user.brandId || null,
      isStaff: ["WAITER", "CHEF"].includes(user.role),
    };

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
