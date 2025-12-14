// src/controllers/invite.controller.js
import crypto from "crypto";
import UserModel from "../models/user.model.js";
import RestaurantModel from "../models/restaurant.model.js";
import sendEmail from "../config/sendEmail.js";
import AuditLog from "../models/auditLog.model.js"; // optional - remove if not present

// POST /restaurants/:restaurantId/invite-manager
export async function inviteManagerController(req, res) {
  try {
    const admin = req.user; // requireAuth + requireRole('BRAND_ADMIN')
    const { restaurantId } = req.params;
    const { name, email } = req.body;

    if (!name || !email)
      return res
        .status(400)
        .json({
          message: "name & email required",
          error: true,
          success: false,
        });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        error: true,
        success: false,
      });
    }

    // Check restaurant exists and belongs to admin.brandId
    const restaurant = await RestaurantModel.findById(restaurantId).lean();
    if (!restaurant)
      return res
        .status(404)
        .json({ message: "Restaurant not found", error: true, success: false });
    if (String(restaurant.brandId) !== String(admin.brandId))
      return res
        .status(403)
        .json({
          message: "Forbidden - restaurant not under your brand",
          error: true,
          success: false,
        });

    // Check if email is already used by a manager in this brand/restaurant
    const existing = await UserModel.findOne({ email }).lean();
    if (
      existing &&
      existing.role === "MANAGER" &&
      String(existing.restaurantId) === String(restaurantId)
    ) {
      return res
        .status(409)
        .json({
          message: "Manager already exists for this restaurant",
          error: true,
          success: false,
        });
    }

    // Generate invite token: rawToken (sent over email) and store only hash
    const rawToken = crypto.randomBytes(28).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation user (inactive)
    const newUser = await UserModel.create({
      name,
      email,
      role: "MANAGER",
      brandId: admin.brandId,
      restaurantId,
      isActive: false,
      verify_email: false,
      meta: {
        inviteTokenHash: tokenHash,
        inviteExpiresAt: expiresAt,
      },
    });

    // Build invite URL (frontend will call /auth/accept-invite)
    const inviteUrl = `${process.env.FRONTEND_URL.replace(
      /\/$/,
      ""
    )}/accept-invite?token=${rawToken}&uid=${newUser._id}`;

    // Send email (best-effort)
    sendEmail({
      sendTo: email,
      subject: `You're invited to manage ${restaurant.name}`,
      html: `<p>Hi ${name},</p>
             <p>You were invited to manage <strong>${restaurant.name}</strong>.</p>
             <p>Click to accept: <a href="${inviteUrl}">${inviteUrl}</a></p>
             <p>This link expires in 7 days.</p>`,
    }).catch((e) => console.error("sendEmail failed", e));

    // Audit
    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(admin._id),
        action: "INVITE_MANAGER",
        entityType: "User",
        entityId: String(newUser._id),
      });
    } catch (e) {
      /* ignore audit errors */
    }

    // NOTE: In production you should NOT return raw token. For development convenience we return inviteUrl.
    return res
      .status(201)
      .json({
        message: "Manager invited",
        error: false,
        success: true,
        data: { inviteUrl, userId: newUser._id },
      });
  } catch (err) {
    console.error("inviteManagerController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// Optional: Assign an existing user as manager
// POST /restaurants/:restaurantId/assign-existing-manager  { userId }
export async function assignExistingManagerController(req, res) {
  try {
    const admin = req.user;
    const { restaurantId } = req.params;
    const { userId } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ message: "userId required", error: true, success: false });

    const restaurant = await RestaurantModel.findById(restaurantId).lean();
    if (!restaurant)
      return res
        .status(404)
        .json({ message: "Restaurant not found", error: true, success: false });
    if (String(restaurant.brandId) !== String(admin.brandId))
      return res
        .status(403)
        .json({ message: "Forbidden", error: true, success: false });

    const user = await UserModel.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", error: true, success: false });

    user.role = "MANAGER";
    user.brandId = admin.brandId;
    user.restaurantId = restaurantId;
    user.isActive = true;
    user.verify_email = true;
    await user.save();

    try {
      await AuditLog.create({
        actorType: "USER",
        actorId: String(admin._id),
        action: "ASSIGN_EXISTING_MANAGER",
        entityType: "User",
        entityId: String(user._id),
      });
    } catch (e) {}

    return res.json({
      message: "User assigned as manager",
      error: false,
      success: true,
      data: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("assignExistingManagerController error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}
