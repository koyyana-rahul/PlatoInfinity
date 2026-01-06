// server/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import crypto from "crypto";

import UserModel from "../models/user.model.js";
import uploadImageClodinary from "../utils/uploadImageClodinary.js";
import getInviteEmailTemplate from "../utils/getInviteEmailTemplate.js";
import userModel from "../models/user.model.js";
// import uploadImageClodinary from "../utils/uploadImageClodinary.js"; // optional, used in uploadAvatar

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Helpers
function signAccessToken(userId) {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  });
}
function signRefreshToken(userId) {
  return jwt.sign({ _id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  });
}

function generateOtp() {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashString(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

const isProd = process.env.NODE_ENV === "production";

function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    // maxAge omitted for accessToken cookie (token expiry enforced by JWT); you can set if desired
  };
}

async function sendVerifyEmail({ to, name, url }) {
  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
      <h2>Hello ${name || ""},</h2>
      <p>Please verify your email by clicking the button below:</p>
      <a href="${url}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;">Verify Email</a>
      <p>If the button doesn't work, open this URL: ${url}</p>
      <p>Thanks,<br/>Team</p>
    </div>
  `;
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "Verify your email",
    html,
  });
}

async function sendForgotPasswordEmail({ to, name, otp }) {
  const html = `
    <div style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
      <h3>Hello ${name || ""},</h3>
      <p>Here is your password reset OTP (valid for 1 hour):</p>
      <div style="font-size:22px;font-weight:700;padding:10px 0">${otp}</div>
      <p>If you didn't request a password reset, ignore this email.</p>
    </div>
  `;
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: "Password reset OTP",
    html,
  });
}

// CONTROLLERS

// Register (Brand admin or generic)

export async function registerUserController(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    const exists = await UserModel.findOne({ email });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    const user = await UserModel.create({
      name,
      email,
      password: hashed,
      role: "BRAND_ADMIN",
      verify_email: false,
      emailVerifyToken: token,
      emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "You're invited – Verify your email",
      html: getInviteEmailTemplate({
        name: user.name, // optional
        verifyUrl,
        appName: "Plato", // change if needed
      }),
    });

    res.status(201).json({
      success: true,
      message: "Account created. Please verify your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
// Verify email

// src/controllers/auth.controller.js
export async function verifyEmailController(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token missing",
      });
    }

    const user = await UserModel.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link",
      });
    }

    user.verify_email = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    user.lastLoginAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("verifyEmailController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function loginController(req, res) {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).select(
    "+password +refreshToken"
  );
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  if (!user.verify_email) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email before logging in",
    });
  }

  // 🔐 Generate tokens
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // 🔐 Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save();

  const isProd = process.env.NODE_ENV === "production";

  // 🍪 Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return res.json({
    success: true,
    message: "Login successful",
  });
}
// Logout
export async function logoutController(req, res) {
  try {
    const userId = req.userId || (req.user && req.user._id) || null;
    if (userId) {
      // clear refresh token in DB
      await UserModel.findByIdAndUpdate(userId, {
        $set: { refreshToken: "" },
      });
    }

    const options = cookieOptions();
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.json({
      message: "Logout successful",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("logoutController:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// Refresh token
export async function refreshTokenController(req, res) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }

  const user = await UserModel.findById(payload._id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token mismatch",
    });
  }

  // 🔁 Issue new access token
  const newAccessToken = signAccessToken(user._id);

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  return res.json({
    success: true,
    message: "Access token refreshed",
  });
}
// Forgot password - send OTP
export async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ message: "Email required", error: true, success: false });

    const user = await UserModel.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email not registered", error: true, success: false });

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.forgotPasswordOtpHash = otp;
    user.forgotPasswordExpiry = expiry;
    await user.save();

    try {
      await sendForgotPasswordEmail({ to: email, name: user.name, otp });
    } catch (e) {
      console.warn("resend forgot email failed:", e?.message || e);
    }

    return res.json({
      message: "OTP sent to email",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("forgotPasswordController:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// Verify forgot password OTP
export async function verifyForgotPasswordOtpController(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({
        message: "email and otp required",
        error: true,
        success: false,
      });

    const user = await UserModel.findOne({ email }).select(
      "+forgotPasswordOtpHash +forgotPasswordExpiry"
    );
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid email", error: true, success: false });

    if (!user.forgotPasswordOtpHash || user.forgotPasswordOtpHash !== otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", error: true, success: false });
    }

    if (
      user.forgotPasswordExpiry &&
      new Date() > new Date(user.forgotPasswordExpiry)
    ) {
      return res
        .status(400)
        .json({ message: "OTP expired", error: true, success: false });
    }

    // clear otp after verification
    user.forgotPasswordOtpHash = "";
    user.forgotPasswordExpiry = null;
    await user.save();

    return res.json({ message: "OTP verified", error: false, success: true });
  } catch (err) {
    console.error("verifyForgotPasswordOtpController:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// Reset password after OTP verified
export async function resetPasswordController(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword)
      return res.status(400).json({
        message: "Provide required fields",
        error: true,
        success: false,
      });

    if (newPassword !== confirmPassword)
      return res.status(400).json({
        message: "Passwords do not match",
        error: true,
        success: false,
      });

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid email", error: true, success: false });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // clear forgot OTP fields
    user.forgotPasswordOtpHash = "";
    user.forgotPasswordExpiry = null;

    await user.save();

    return res.json({
      message: "Password reset successful",
      error: false,
      success: true,
    });
  } catch (err) {
    console.error("resetPasswordController:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// Upload avatar (expects multer `req.file`), calls uploadImageClodinary helper

export async function uploadAvatarController(req, res) {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId)
      return res.status(401).json({
        message: "Authentication required",
        error: true,
        success: false,
      });

    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ message: "File required", error: true, success: false });

    try {
      const buffer = Buffer.from(file.buffer);
      const uploadRes = await uploadImageClodinary(buffer);
      await UserModel.findByIdAndUpdate(userId, {
        avatar: uploadRes.secure_url,
      });
      return res.json({
        message: "Avatar uploaded",
        error: false,
        success: true,
        data: { avatar: uploadRes.secure_url },
      });
    } catch (e) {
      console.error("uploadAvatarController upload error:", e);
      return res
        .status(500)
        .json({ message: "Upload failed", error: true, success: false });
    }
  } catch (err) {
    console.error("uploadAvatarController:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// Update user details
export async function updateUserDetailsController(req, res) {
  try {
    const userId = req.userId || (req.user && req.user._id);
    if (!userId)
      return res.status(401).json({
        message: "Authentication required",
        error: true,
        success: false,
      });

    const { name, email, mobile, password } = req.body;
    const updates = {};

    if (name) updates.name = name;

    if (email) {
      const existingEmail = await UserModel.findOne({
        email,
        _id: { $ne: userId },
      }).lean();
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already registered by another user",
          error: true,
          success: false,
        });
      }
      updates.email = email;
    }

    if (mobile) {
      const user = await UserModel.findById(userId).lean();
      const query = { mobile, _id: { $ne: userId } };
      if (user && user.restaurantId) {
        query.restaurantId = user.restaurantId;
      }
      const existingMobile = await UserModel.findOne(query).lean();
      if (existingMobile) {
        const message =
          user && user.restaurantId
            ? "Mobile number already registered in this restaurant"
            : "Mobile number already registered by another user";
        return res.status(400).json({
          message,
          error: true,
          success: false,
        });
      }
      updates.mobile = mobile;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updated = await UserModel.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -refresh_token");

    return res.json({
      message: "Updated successfully",
      error: false,
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("updateUserDetailsController:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: `${
          err.message.includes("email") ? "Email" : "Mobile"
        } already exists`,
        error: true,
        success: false,
      });
    }

    return res
      .status(500)
      .json({ message: "Server error", error: true, success: false });
  }
}

// Get logged-in user details (requires auth middleware to set req.userId)

export async function userDetailsController(req, res) {
  try {
    const userId = req.userId || (req.user && req.user._id);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findById(userId)
      .select(
        "-password -refresh_token -forgot_password_otp -forgot_password_expiry"
      )
      .populate("brandId", "name slug logoUrl")
      .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "User details",
      success: true,
      error: false,
      data: {
        ...user,
        brand: user.brandId || null, // 👈 VERY IMPORTANT
      },
    });
  } catch (err) {
    console.error("userDetailsController:", err);
    return res.status(500).json({
      message: "Server error",
      error: true,
      success: false,
    });
  }
}

// export async function setPasswordController(req, res) {
//   try {
//     const { userId, password } = req.body;

//     if (!password || password.length < 6)
//       return res.status(400).json({ message: "Password too short" });

//     const user = await UserModel.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.password = await bcrypt.hash(password, 10);
//     user.isActive = true;
//     user.verify_email = true;
//     user.meta.inviteTokenHash = null;
//     user.meta.inviteExpiresAt = null;

//     await user.save();

//     return res.json({
//       success: true,
//       message: "Password set successfully",
//     });
//   } catch (err) {
//     console.error("setPasswordController:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }

// import crypto from "crypto";
// import bcrypt from "bcryptjs";
// import User from "../models/user.model.js";

// export async function acceptInviteController(req, res) {
//   const { token } = req.query;

//   if (!token) {
//     return res.status(400).json({ message: "Invalid invite link" });
//   }

//   const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

//   const user = await userModel
//     .findOne({
//       "meta.inviteTokenHash": tokenHash,
//       "meta.inviteExpiresAt": { $gt: Date.now() },
//     })
//     .select("name email role");

//   if (!user) {
//     return res.status(400).json({
//       message: "Invite expired or already used",
//     });
//   }

//   return res.json({
//     success: true,
//     data: {
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     },
//   });
// }

// export async function setPasswordController(req, res) {
//   const { token, password } = req.body;

//   if (!token || !password || password.length < 6) {
//     return res.status(400).json({ message: "Invalid request" });
//   }

//   const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

//   const user = await User.findOne({
//     "meta.inviteTokenHash": tokenHash,
//     "meta.inviteExpiresAt": { $gt: Date.now() },
//   });

//   if (!user) {
//     return res.status(400).json({ message: "Invite expired" });
//   }

//   user.password = await bcrypt.hash(password, 10);
//   user.isActive = true;
//   user.verify_email = true;
//   user.meta.inviteTokenHash = undefined;
//   user.meta.inviteExpiresAt = undefined;

//   await user.save();

//   res.json({ success: true, message: "Password set successfully" });
// }

// Export default for convenience as well (routes may import named exports)
export default {
  registerUserController,
  verifyEmailController,
  loginController,
  logoutController,
  refreshTokenController,
  forgotPasswordController,
  verifyForgotPasswordOtpController,
  resetPasswordController,
  // uploadAvatarController,
  updateUserDetailsController,
  userDetailsController,
  // setPasswordController,
};
