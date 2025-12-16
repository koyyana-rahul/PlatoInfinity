// src/controllers/staff.controller.js
import UserModel from "../models/user.model.js";
import AuditLog from "../models/auditLog.model.js"; // optional
import mongoose from "mongoose";

import generatedAccessToken from "../utils/generatedAccessToken.js";
import genertedRefreshToken from "../utils/generatedRefreshToken.js";
import { cookieOptions } from "../utils/cookieOptions.js";

/**
 * Helper: generateUniquePin(restaurantId)
 * Tries to generate a unique 4-digit pin for the given restaurantId
 */
async function generateUniquePin(restaurantId, maxTries = 12) {
  for (let i = 0; i < maxTries; i++) {
    const cand = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
    const found = await UserModel.findOne({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      staffPin: cand,
    }).lean();
    if (!found) return cand;
  }
  return null;
}

/**
 * POST /restaurants/:restaurantId/staff
 * Manager-only: create staff (WAITER/CHEF/CASHIER)
 * Body: { name, role, mobile?, kitchenStationId? }
 */
export async function createStaffController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    const {
      name,
      role = "WAITER",
      mobile = null,
      kitchenStationId = null,
    } = req.body;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({
        message: "Forbidden - not your restaurant",
        error: true,
        success: false,
      });
    }
    if (!name)
      return res
        .status(400)
        .json({ message: "name required", error: true, success: false });
    if (!["WAITER", "CHEF", "CASHIER"].includes(role))
      return res
        .status(400)
        .json({ message: "invalid role", error: true, success: false });

    if (mobile) {
      const existingMobile = await UserModel.findOne({
        mobile,
        restaurantId,
      }).lean();
      if (existingMobile) {
        return res.status(400).json({
          message: "Mobile number already registered in this restaurant",
          error: true,
          success: false,
        });
      }
    }

    const pin = await generateUniquePin(restaurantId);
    if (!pin)
      return res.status(500).json({
        message: "Unable to generate unique PIN, try again",
        error: true,
        success: false,
      });

    const staff = await UserModel.create({
      name,
      role,
      restaurantId,
      brandId: manager.brandId,
      staffPin: pin,
      mobile,
      isActive: true,
      kitchenStationId: kitchenStationId || null,
    });

    // Audit
    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "CREATE_STAFF",
        entityType: "User",
        entityId: String(staff._id),
      });
    } catch (e) {}

    return res.status(201).json({
      message: "Staff created",
      error: false,
      success: true,
      data: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
        staffPin: staff.staffPin,
      },
    });
  } catch (err) {
    console.error("createStaffController error:", err);
    return res.status(500).json({
      message: err.message || "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * GET /restaurants/:restaurantId/staff
 * Manager-only: list staff in the restaurant
 */
export async function listStaffController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    if (String(manager.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const staffList = await UserModel.find({ restaurantId })
      .select(
        "_id name role staffPin mobile isActive kitchenStationId createdAt"
      )
      .lean();
    return res.json({
      message: "staff list",
      error: false,
      success: true,
      data: staffList,
    });
  } catch (err) {
    console.error("listStaffController error:", err);
    return res.status(500).json({
      message: err.message || "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * POST /restaurants/:restaurantId/staff/:staffId/regenerate-pin
 * Manager-only: regenerate staff PIN (inval idates old PIN)
 * Body: {}
 */
export async function regenerateStaffPinController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId, staffId } = req.params;

    if (String(manager.restaurantId) !== String(restaurantId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const staff = await UserModel.findById(staffId);
    if (!staff || String(staff.restaurantId) !== String(restaurantId))
      return res
        .status(404)
        .json({ message: "Staff not found", error: true, success: false });

    const newPin = await generateUniquePin(restaurantId);
    if (!newPin)
      return res.status(500).json({
        message: "Unable to generate unique PIN",
        error: true,
        success: false,
      });

    staff.staffPin = newPin;
    await staff.save();

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(manager._id),
        action: "REGENERATE_STAFF_PIN",
        entityType: "User",
        entityId: String(staff._id),
      });
    } catch (e) {}

    return res.json({
      message: "PIN regenerated",
      error: false,
      success: true,
      data: { staffId: staff._id, staffPin: newPin },
    });
  } catch (err) {
    console.error("regenerateStaffPinController error:", err);
    return res.status(500).json({
      message: err.message || "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * POST /auth/staff-login
 * Public: login via staff PIN
 * Body: { restaurantId, staffPin }
 *
 * Security: callers MUST implement rate-limit / brute-force protection.
 */
export async function staffLoginController(req, res) {
  try {
    const { restaurantId, staffPin } = req.body;

    if (!restaurantId || !staffPin) {
      return res.status(400).json({
        message: "restaurantId & staffPin required",
        error: true,
        success: false,
      });
    }

    // ✅ Only STAFF roles allowed
    const staff = await UserModel.findOne({
      restaurantId,
      staffPin,
      isActive: true,
      role: { $in: ["WAITER", "CHEF", "MANAGER"] },
    });

    if (!staff) {
      try {
        await AuditLog.create({
          actorType: "SYSTEM",
          action: "STAFF_PIN_FAIL",
          entityType: "User",
          meta: { restaurantId },
        });
      } catch (_) {}

      return res.status(401).json({
        message: "Invalid PIN",
        error: true,
        success: false,
      });
    }

    // 🔑 Generate tokens
    const accessToken = generatedAccessToken(staff._id);
    const refreshToken = genertedRefreshToken(staff._id);

    // 🔁 Save refresh token
    staff.refresh_token = refreshToken;
    await staff.save();

    // 🍪 Set cookies (SAME AS USER LOGIN)
    res.cookie("accessToken", accessToken, cookieOptions());
    res.cookie("refreshToken", refreshToken, cookieOptions());

    return res.json({
      message: "Staff login successful",
      error: false,
      success: true,
      data: {
        user: {
          id: staff._id,
          name: staff.name,
          role: staff.role,
          restaurantId: staff.restaurantId,
          isStaff: true,
        },
      },
    });
  } catch (err) {
    console.error("staffLoginController error:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
