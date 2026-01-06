// src/controllers/auth.invite.controller.js
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

/**
 * GET /api/auth/invite/verify
 */
export async function verifyInviteController(req, res) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Invalid invite link" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      "meta.inviteTokenHash": tokenHash,
      "meta.inviteExpiresAt": { $gt: Date.now() },
    }).select("name email role");

    if (!user) {
      return res.status(400).json({
        message: "Invite expired or already used",
      });
    }

    return res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("verifyInviteController:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/auth/invite/set-password
 */
export async function setPasswordController(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      "meta.inviteTokenHash": tokenHash,
      "meta.inviteExpiresAt": { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invite expired or already used",
      });
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.isActive = true;
    user.verify_email = true;

    // 🔐 invalidate token
    user.meta.inviteTokenHash = undefined;
    user.meta.inviteExpiresAt = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Password set successfully",
    });
  } catch (err) {
    console.error("setPasswordController:", err);
    res.status(500).json({ message: "Server error" });
  }
}
