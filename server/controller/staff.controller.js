import User from "../models/user.model.js";
import Shift from "../models/shift.model.js";
import Restaurant from "../models/restaurant.model.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import { generateStaffCode } from "../utils/generateStaffCode.js";

/* ======================================================
   UTIL: Generate Unique Staff PIN (PER RESTAURANT)
====================================================== */
export async function generateUniquePin(restaurantId) {
  const MAX_ATTEMPTS = 15;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const exists = await User.exists({
      restaurantId,
      staffPin: pin,
    });

    if (!exists) return pin;
  }

  throw new Error("PIN_GENERATION_FAILED");
}

/* ======================================================
   CREATE STAFF (MANAGER ONLY)
====================================================== */
export async function createStaffController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;
    const { name, role, mobile, kitchenStationId } = req.body;

    if (manager.role !== "MANAGER") {
      return res.status(403).json({ message: "Manager access only" });
    }

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized restaurant access" });
    }

    if (!name?.trim()) {
      return res.status(400).json({ message: "Staff name required" });
    }

    if (!["WAITER", "CHEF", "CASHIER"].includes(role)) {
      return res.status(400).json({ message: "Invalid staff role" });
    }

    if (mobile) {
      const exists = await User.exists({ restaurantId, mobile });
      if (exists) {
        return res
          .status(409)
          .json({ message: "Mobile already used in this restaurant" });
      }
    }

    /* 🔑 CRITICAL: Generate PIN BEFORE create */
    const staffPin = await generateUniquePin(restaurantId);
    const staffCode = await generateStaffCode(User, restaurantId, role);

    const staff = await User.create({
      name: name.trim(),
      role,
      staffCode,
      staffPin,
      mobile: mobile || undefined,
      restaurantId,
      brandId: manager.brandId,
      kitchenStationId: role === "CHEF" ? kitchenStationId || null : null,
      isActive: true,
      onDuty: false,
    });

    /* ✅ RETURN GENERATED PIN (NOT FROM DB DOC) */
    return res.status(201).json({
      success: true,
      data: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
        staffCode,
        staffPin, // 👈 SHOW ONLY ONCE
      },
    });
  } catch (err) {
    console.error("createStaffController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   LIST STAFF (MANAGER)
====================================================== */
export async function listStaffController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId } = req.params;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const staff = await User.find({
      restaurantId,
      role: { $in: ["WAITER", "CHEF", "CASHIER"] },
    })
      .select(
        "_id name role staffCode staffPin mobile isActive onDuty lastShiftIn lastShiftOut createdAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: staff });
  } catch (err) {
    console.error("listStaffController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   REGENERATE STAFF PIN (MANAGER)
====================================================== */
export async function regenerateStaffPinController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId, staffId } = req.params;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    /* 🔑 MUST SELECT staffPin */
    const staff = await User.findOne({
      _id: staffId,
      restaurantId,
      isActive: true,
    }).select("+staffPin");

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const newPin = await generateUniquePin(restaurantId);

    staff.staffPin = newPin;
    await staff.save();

    return res.json({
      success: true,
      data: {
        staffId: staff._id,
        staffPin: newPin, // 👈 SHOW ONCE
      },
    });
  } catch (err) {
    console.error("regenerateStaffPinController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   TOGGLE STAFF ACTIVE / INACTIVE
====================================================== */
export async function toggleStaffActiveController(req, res) {
  try {
    const manager = req.user;
    const { restaurantId, staffId } = req.params;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const staff = await User.findOne({ _id: staffId, restaurantId });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.isActive = !staff.isActive;

    if (!staff.isActive) {
      staff.onDuty = false;
      staff.lastShiftOut = new Date();
    }

    await staff.save();

    res.json({ success: true, isActive: staff.isActive });
  } catch (err) {
    console.error("toggleStaffActiveController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   STAFF LOGIN (QR + PIN)
====================================================== */
// src/controllers/staff.controller.js

// src/controllers/staff.controller.js
export async function staffLoginController(req, res) {
  try {
    const { staffPin, qrToken } = req.body;

    const shift = await Shift.findOne({
      qrToken,
      status: "OPEN",
      qrIsActive: true,
      qrExpiresAt: { $gt: new Date() },
    });

    if (!shift) {
      return res.status(401).json({ message: "Invalid or expired QR" });
    }

    const staff = await User.findOne({
      restaurantId: shift.restaurantId,
      staffPin,
      isActive: true,
      role: { $in: ["WAITER", "CHEF", "CASHIER"] },
    });

    if (!staff) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    // 🔑 Always resolve brand via restaurant
    const restaurant = await Restaurant.findById(shift.restaurantId)
      .populate("brandId", "slug")
      .select("brandId")
      .lean();

    if (!restaurant?.brandId?.slug) {
      return res.status(500).json({ message: "Brand not configured" });
    }

    staff.onDuty = true;
    staff.lastShiftIn = new Date();

    const accessToken = generatedAccessToken(staff._id);
    const refreshToken = generatedRefreshToken(staff._id);

    staff.refreshToken = refreshToken;
    await staff.save();

    res.cookie("accessToken", accessToken, cookieOptions());
    res.cookie("refreshToken", refreshToken, cookieOptions());

    return res.json({
      success: true,
      data: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
        restaurantId: staff.restaurantId,
        brandSlug: restaurant.brandId.slug,
        accessToken, // ✅ INCLUDE TOKEN IN RESPONSE BODY
        refreshToken, // ✅ INCLUDE REFRESH TOKEN
      },
    });
  } catch (err) {
    console.error("staffLoginController:", err);
    res.status(500).json({ message: "Server error" });
  }
}
/* ======================================================
   STAFF SHIFT START (CLOCK IN)
====================================================== */
export async function startStaffShiftController(req, res) {
  try {
    const staff = req.user;

    if (!["WAITER", "CHEF", "CASHIER"].includes(staff.role)) {
      return res.status(403).json({ message: "Staff only" });
    }

    // ✅ IDEMPOTENT: If already on duty, return current shift
    if (staff.onDuty) {
      return res.json({
        success: true,
        message: "Already on duty",
        data: {
          id: staff._id,
          name: staff.name,
          role: staff.role,
          onDuty: true,
          shiftStartedAt: staff.lastShiftIn,
        },
      });
    }

    // ⏰ START SHIFT
    staff.onDuty = true;
    staff.lastShiftIn = new Date();
    await staff.save();

    return res.json({
      success: true,
      message: "Shift started",
      data: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
        onDuty: true,
        shiftStartedAt: staff.lastShiftIn,
      },
    });
  } catch (err) {
    console.error("startStaffShiftController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   STAFF SHIFT END (LOGOUT)
====================================================== */
export async function endStaffShiftController(req, res) {
  try {
    const staff = req.user; // REAL User document

    if (!["WAITER", "CHEF", "CASHIER"].includes(staff.role)) {
      return res.status(403).json({ message: "Staff only" });
    }

    // ✅ IDMPOTENT BEHAVIOR
    if (staff.onDuty) {
      staff.onDuty = false;
      staff.lastShiftOut = new Date();
      staff.refreshToken = null;
      await staff.save();
    }

    // ✅ Always clear cookies (safe even if already cleared)
    res.clearCookie("accessToken", cookieOptions());
    res.clearCookie("refreshToken", cookieOptions());

    return res.json({
      success: true,
      message: "Shift ended",
    });
  } catch (err) {
    console.error("endStaffShiftController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   GET STAFF SHIFT STATUS
====================================================== */
export async function getStaffShiftStatusController(req, res) {
  try {
    const staff = req.user;

    if (!["WAITER", "CHEF", "CASHIER"].includes(staff.role)) {
      return res.status(403).json({ message: "Staff only" });
    }

    return res.json({
      success: true,
      data: {
        id: staff._id,
        name: staff.name,
        role: staff.role,
        onDuty: staff.onDuty,
        shiftStartedAt: staff.lastShiftIn,
        shiftEndedAt: staff.lastShiftOut,
      },
    });
  } catch (err) {
    console.error("getStaffShiftStatusController:", err);
    res.status(500).json({ message: "Server error" });
  }
}
