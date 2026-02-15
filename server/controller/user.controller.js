import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";

/**
 * Update user profile (name, email, phone)
 */
export async function updateUserProfileController(req, res) {
  try {
    const userId = req.user._id;
    const { name, email, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.mobile = phone;

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Profile updated successfully",
      error: false,
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    console.error("updateUserProfileController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

/**
 * Change user password
 */
export async function changePasswordController(req, res) {
  try {
    const userId = req.user._id;
    const { current, new: newPassword } = req.body;

    if (!current || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required",
        error: true,
        success: false,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        error: true,
        success: false,
      });
    }

    // Get user with password
    const user = await UserModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
        error: true,
        success: false,
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return res.json({
      message: "Password changed successfully",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("changePasswordController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}
