// src/controllers/auth.invite.controller.js
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import UserModel from "../models/user.model.js";
import AuditLog from "../models/auditLog.model.js"; // optional
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

/**
 * POST /auth/accept-invite
 * Body: { token, uid, name, password }
 */
export async function acceptInviteController(req, res) {
    try {
        const { token, uid, name, password } = req.body;
        if (!token || !uid || !password)
            return res.status(400).json({
                message: "token, uid, password required",
                error: true,
                success: false,
            });

        const user = await UserModel.findById(uid);
        if (!user)
            return res
                .status(400)
                .json({ message: "Invalid invite", error: true, success: false });

        const storedHash = user.meta?.inviteTokenHash;
        const expiresAt = user.meta?.inviteExpiresAt;
        if (!storedHash || !expiresAt)
            return res.status(400).json({
                message: "Invalid invite token",
                error: true,
                success: false,
            });
        if (new Date() > new Date(expiresAt))
            return res
                .status(400)
                .json({ message: "Invite expired", error: true, success: false });

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");
        if (tokenHash !== storedHash)
            return res.status(400).json({
                message: "Invalid invite token",
                error: true,
                success: false,
            });

        // set password
        const salt = await bcryptjs.genSalt(SALT_ROUNDS);
        const passwordHash = await bcryptjs.hash(password, salt);

        user.password = passwordHash;
        user.name = name || user.name;

        // Generate email verification token
        const emailVerifyToken = crypto.randomBytes(32).toString("hex");
        user.emailVerifyToken = emailVerifyToken;
        user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // clear invite meta
        if (user.meta) {
            delete user.meta.inviteTokenHash;
            delete user.meta.inviteExpiresAt;
        }
        await user.save();

        // Send verification email
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: user.email,
            subject: "Verify your email",
            html: `<a href="${verifyUrl}">Verify Email</a>`,
        });

        try {
            await AuditLog.create({
                actorType: "USER",
                actorId: String(user._id),
                action: "ACCEPT_INVITE",
                entityType: "User",
                entityId: String(user._id),
            });
        } catch (e) { }

        return res.json({
            message: "Invite accepted. Please verify your email.",
            error: false,
            success: true,
        });
    } catch (err) {
        console.error("acceptInviteController error:", err);
        return res
            .status(500)
            .json({ message: "Server error", error: true, success: false });
    }
}
