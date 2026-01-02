import crypto from "crypto";
import User from "../models/user.model.js";
import Restaurant from "../models/restaurant.model.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/* ================= LIST MANAGERS ================= */
export async function listManagersController(req, res) {
  try {
    const { restaurantId } = req.params;

    const managers = await User.find({
      restaurantId,
      role: "MANAGER",
    })
      .select("name email isActive createdAt")
      .lean();

    return res.json({
      success: true,
      data: managers,
    });
  } catch (err) {
    console.error("listManagersController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/* ================= INVITE MANAGER ================= */
export async function inviteManagerController(req, res) {
  try {
    const admin = req.user;
    const { restaurantId } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email required",
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      brandId: admin.brandId,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 🔐 Create invite token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const user = await User.create({
      name,
      email,
      role: "MANAGER",
      brandId: admin.brandId,
      restaurantId,
      isActive: false,
      verify_email: false,
      meta: {
        inviteTokenHash: tokenHash,
        inviteExpiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24h
      },
    });

    // 📧 Send invite email
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${rawToken}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: `You're invited as Manager – ${restaurant.name}`,
      html: `
        <h3>Hello ${name}</h3>
        <p>You have been invited as a manager for <b>${restaurant.name}</b>.</p>
        <a href="${inviteUrl}" style="padding:10px 16px;background:#00684A;color:#fff;border-radius:6px;text-decoration:none;">
          Accept Invite
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Manager invited successfully",
    });
  } catch (err) {
    console.error("inviteManagerController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/* ================= REMOVE MANAGER ================= */
export async function removeManagerController(req, res) {
  try {
    const { restaurantId, managerId } = req.params;

    const manager = await User.findOneAndDelete({
      _id: managerId,
      restaurantId,
      role: "MANAGER",
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    return res.json({
      success: true,
      message: "Manager removed",
    });
  } catch (err) {
    console.error("removeManagerController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
