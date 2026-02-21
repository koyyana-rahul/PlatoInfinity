/**
 * STAFF PIN LOGIN CONTROLLER
 * Handles 4-digit PIN-based authentication for kitchen/waiter/cashier staff
 * Allows shift-based login without email/password for simplicity
 */

import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { verifyStaffPin, generateRandomPin } from "../utils/staffPinAuth.js";
import { sendStaffPINViaWhatsApp } from "../utils/whatsappIntegration.js";

/**
 * POST /api/auth/staff/pin-login
 * Staff login using 4-digit PIN and staff code
 * Returns JWT token for socket.io and API auth
 */
export async function staffPinLoginController(req, res) {
  try {
    const { staffCode, pin, restaurantId } = req.body;

    // Validation
    if (!staffCode || !pin || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: "staffCode, pin, and restaurantId required",
      });
    }

    if (String(pin).length !== 4) {
      return res.status(400).json({
        success: false,
        message: "PIN must be 4 digits",
      });
    }

    // Find staff by code + restaurant
    const staff = await UserModel.findOne({
      staffCode: String(staffCode).trim(),
      restaurantId,
      isActive: true,
    }).select("+staffPin");

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: "Staff code not found or inactive",
      });
    }

    // If staff doesn't have a PIN, generate one
    if (!staff.staffPin) {
      const newPin = generateRandomPin();
      staff.staffPin = newPin; // Should be hashed in pre-save hook
      await staff.save();

      // Send PIN via WhatsApp if phone available
      if (staff.mobile) {
        await sendStaffPINViaWhatsApp(staff.mobile, staff.name, newPin);
      }

      return res.status(400).json({
        success: false,
        message: "PIN generated and sent to your phone. Please try again.",
        requireNewPin: true,
      });
    }

    // Verify PIN
    const isPinValid = await verifyStaffPin(String(pin), staff.staffPin);
    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid PIN",
      });
    }

    // Mark as on-duty
    staff.onDuty = true;
    staff.lastShiftIn = new Date();
    await staff.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: staff._id,
        email: staff.email,
        role: staff.role,
        restaurantId: staff.restaurantId,
        staffCode: staff.staffCode,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 1000,
    });

    // Return success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: staff._id,
        name: staff.name,
        role: staff.role,
        staffCode: staff.staffCode,
        restaurantId: staff.restaurantId,
        kitchenStationId: staff.kitchenStationId,
      },
      token,
    });
  } catch (error) {
    console.error("Staff PIN login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/staff/pin-logout
 * Mark staff as off-duty
 */
export async function staffPinLogoutController(req, res) {
  try {
    const userId = req.user?._id; // from JWT auth

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const staff = await UserModel.findById(userId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    staff.onDuty = false;
    staff.lastShiftOut = new Date();
    await staff.save();

    // Clear cookie
    res.clearCookie("accessToken");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Staff logout error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/staff/confirm-action
 * Verify staff PIN before critical actions (mark ready, serve, close bill)
 * Used to prevent accidentally approving wrong items
 */
export async function confirmStaffActionController(req, res) {
  try {
    const { pin } = req.body;
    const userId = req.user?._id;

    if (!pin || !userId) {
      return res.status(400).json({
        success: false,
        message: "PIN and authentication required",
      });
    }

    const staff = await UserModel.findById(userId).select("+staffPin");
    if (!staff || !staff.staffPin) {
      return res.status(401).json({
        success: false,
        message: "Staff not found",
      });
    }

    const isPinValid = await verifyStaffPin(String(pin), staff.staffPin);
    if (!isPinValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid PIN",
      });
    }

    // Return a temporary action token (valid for 2 minutes)
    const actionToken = jwt.sign(
      { _id: userId, action: "confirmed" },
      process.env.JWT_SECRET,
      { expiresIn: "2m" },
    );

    return res.status(200).json({
      success: true,
      message: "PIN verified",
      actionToken,
    });
  } catch (error) {
    console.error("Staff action confirmation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/staff/reset-pin
 * Allow staff to reset their PIN (send new PIN via WhatsApp)
 */
export async function resetStaffPinController(req, res) {
  try {
    const { staffCode, restaurantId } = req.body;

    if (!staffCode || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: "staffCode and restaurantId required",
      });
    }

    const staff = await UserModel.findOne({
      staffCode: String(staffCode).trim(),
      restaurantId,
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    if (!staff.mobile) {
      return res.status(400).json({
        success: false,
        message: "No phone number on file",
      });
    }

    // Generate new PIN
    const newPin = generateRandomPin();
    staff.staffPin = newPin; // Will be hashed in pre-save hook
    await staff.save();

    // Send via WhatsApp
    const whatsappResult = await sendStaffPINViaWhatsApp(
      staff.mobile,
      staff.name,
      newPin,
    );

    if (!whatsappResult.success) {
      console.warn("WhatsApp send failed, but PIN was reset");
    }

    return res.status(200).json({
      success: true,
      message: "PIN reset. Check WhatsApp for new PIN.",
      detail: "New PIN sent to registered phone number",
    });
  } catch (error) {
    console.error("Reset PIN error:", error.message);
    return res.status(500).json({
      success: false,
      message: "PIN reset failed",
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/staff/change-pin
 * Staff changes their own PIN (requires old PIN)
 */
export async function changeStaffPinController(req, res) {
  try {
    const { oldPin, newPin } = req.body;
    const userId = req.user?._id;

    if (!oldPin || !newPin || !userId) {
      return res.status(400).json({
        success: false,
        message: "Old PIN, new PIN, and authentication required",
      });
    }

    if (String(newPin).length !== 4) {
      return res.status(400).json({
        success: false,
        message: "New PIN must be 4 digits",
      });
    }

    const staff = await UserModel.findById(userId).select("+staffPin");
    if (!staff || !staff.staffPin) {
      return res.status(401).json({
        success: false,
        message: "Staff not found",
      });
    }

    // Verify old PIN
    const isOldPinValid = await verifyStaffPin(String(oldPin), staff.staffPin);
    if (!isOldPinValid) {
      return res.status(401).json({
        success: false,
        message: "Current PIN is incorrect",
      });
    }

    // Update to new PIN
    staff.staffPin = newPin; // Will be hashed in pre-save hook
    await staff.save();

    return res.status(200).json({
      success: true,
      message: "PIN changed successfully",
    });
  } catch (error) {
    console.error("Change PIN error:", error.message);
    return res.status(500).json({
      success: false,
      message: "PIN change failed",
      error: error.message,
    });
  }
}

/**
 * GET /api/auth/staff/me
 * Get current logged-in staff details
 */
export async function getStaffMeController(req, res) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const staff = await UserModel.findById(userId)
      .populate("restaurantId", "name")
      .populate("kitchenStationId", "stationType")
      .select("-staffPin -password");

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    console.error("Get staff error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch staff details",
      error: error.message,
    });
  }
}
