import UserModel from "../models/user.model.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import { cookieOptions } from "../utils/cookieOptions.js";
import { generateStaffCode } from "../utils/generateStaffCode.js";

/* ======================================================
   UTIL: Generate Unique PIN (per restaurant)
====================================================== */
async function generateUniquePin(restaurantId, maxTries = 15) {
  for (let i = 0; i < maxTries; i++) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const exists = await UserModel.exists({ restaurantId, staffPin: pin });
    if (!exists) return pin;
  }
  throw new Error("PIN_GENERATION_FAILED");
}

/* ======================================================
   CREATE STAFF
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
      return res.status(400).json({ message: "Staff name is required" });
    }

    if (!["WAITER", "CHEF", "CASHIER"].includes(role)) {
      return res.status(400).json({ message: "Invalid staff role" });
    }

    if (mobile) {
      const mobileExists = await UserModel.exists({
        restaurantId,
        mobile,
      });
      if (mobileExists) {
        return res.status(409).json({
          message: "Mobile already assigned in this restaurant",
        });
      }
    }

    const staffPin = await generateUniquePin(restaurantId);
    const staffCode = await generateStaffCode(UserModel, restaurantId, role);

    const staff = await UserModel.create({
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

    return res.status(201).json({
      success: true,
      data: {
        id: staff._id,
        name: staff.name,
        staffCode: staff.staffCode,
        role: staff.role,
        staffPin,
      },
    });
  } catch (err) {
    console.error("CREATE STAFF ERROR:", err);

    if (err.message === "PIN_GENERATION_FAILED") {
      return res.status(500).json({ message: "PIN generation failed" });
    }

    return res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   LIST STAFF (SEARCH)
====================================================== */
export async function listStaffController(req, res) {
  try {
    const { restaurantId } = req.params;
    const { q } = req.query;
    const manager = req.user;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const filter = { restaurantId };

    if (q) {
      filter.$or = [
        { staffCode: new RegExp(q, "i") },
        { name: new RegExp(q, "i") },
        { mobile: new RegExp(q, "i") },
      ];
    }

    const staff = await UserModel.find(filter)
      .select(
        "_id name role mobile staffCode staffPin isActive onDuty lastShiftIn lastShiftOut createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: staff });
  } catch (err) {
    console.error("LIST STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   REGENERATE PIN
====================================================== */
export async function regenerateStaffPinController(req, res) {
  try {
    const { restaurantId, staffId } = req.params;
    const manager = req.user;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const staff = await UserModel.findOne({
      _id: staffId,
      restaurantId,
      isActive: true,
    });

    if (!staff) {
      return res.status(404).json({ message: "Active staff not found" });
    }

    staff.staffPin = await generateUniquePin(restaurantId);
    await staff.save();

    res.json({
      success: true,
      data: { staffPin: staff.staffPin },
    });
  } catch (err) {
    console.error("REGENERATE PIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   TOGGLE ACTIVE / INACTIVE
====================================================== */
export async function toggleStaffActiveController(req, res) {
  try {
    const { restaurantId, staffId } = req.params;
    const manager = req.user;

    if (String(manager.restaurantId) !== String(restaurantId)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const staff = await UserModel.findOne({ _id: staffId, restaurantId });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.isActive = !staff.isActive;

    if (!staff.isActive) {
      staff.staffPin = undefined;
      staff.onDuty = false;
      staff.lastShiftOut = new Date();
    }

    await staff.save();

    res.json({
      success: true,
      data: { isActive: staff.isActive },
    });
  } catch (err) {
    console.error("TOGGLE STAFF ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   SHIFT START
====================================================== */
export async function startShiftController(req, res) {
  try {
    const staff = req.user;

    if (!staff.isActive) {
      return res.status(403).json({ message: "Staff inactive" });
    }

    if (staff.onDuty) {
      return res.status(400).json({ message: "Shift already started" });
    }

    staff.onDuty = true;
    staff.lastShiftIn = new Date();
    await staff.save();

    res.json({ success: true, shiftIn: staff.lastShiftIn });
  } catch (err) {
    console.error("START SHIFT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   SHIFT END
====================================================== */
export async function endShiftController(req, res) {
  try {
    const staff = req.user;

    if (!staff.onDuty) {
      return res.status(400).json({ message: "Shift not started" });
    }

    staff.onDuty = false;
    staff.lastShiftOut = new Date();
    await staff.save();

    res.json({ success: true, shiftOut: staff.lastShiftOut });
  } catch (err) {
    console.error("END SHIFT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ======================================================
   STAFF LOGIN
====================================================== */
export async function staffLoginController(req, res) {
  try {
    const { restaurantId, staffPin } = req.body;

    const staff = await UserModel.findOne({
      restaurantId,
      staffPin,
      isActive: true,
      role: { $in: ["WAITER", "CHEF", "CASHIER"] },
    });

    if (!staff) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    const accessToken = generatedAccessToken(staff._id);
    const refreshToken = generatedRefreshToken(staff._id);

    staff.refreshToken = refreshToken;
    staff.lastLoginAt = new Date();
    await staff.save();

    res.cookie("accessToken", accessToken, cookieOptions());
    res.cookie("refreshToken", refreshToken, cookieOptions());

    res.json({
      success: true,
      data: {
        id: staff._id,
        name: staff.name,
        staffCode: staff.staffCode,
        role: staff.role,
      },
    });
  } catch (err) {
    console.error("STAFF LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
}
