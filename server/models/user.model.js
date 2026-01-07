import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/* ================= USER SCHEMA ================= */

const userSchema = new mongoose.Schema(
  {
    /* ---------- BASIC INFO ---------- */
    name: {
      type: String,
      required: [true, "Provide name"],
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "BRAND_ADMIN" || this.role === "MANAGER";
      },
    },

    password: {
      type: String,
      select: false,
    },

    /* ---------- ROLE & ACCESS ---------- */
    role: {
      type: String,
      enum: ["BRAND_ADMIN", "MANAGER", "CHEF", "WAITER", "CASHIER"],
      required: true,
      index: true,
    },

    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },
    staffCode: {
      type: String,
      index: true,
    },

    /* ---------- STAFF PIN (ONLY FOR STAFF) ---------- */
    staffPin: {
      type: String,
      select: false,
      default: null, // IMPORTANT
    },

    kitchenStationId: {
      type: Schema.Types.ObjectId,
      ref: "KitchenStation",
      default: null,
    },

    /* ---------- STATUS ---------- */
    isActive: {
      type: Boolean,
      default: false,
    },

    onDuty: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastShifIn: {
      type: Date,
      default: null,
    },
    lastShiftOut: {
      type: Date,
      default: null,
    },

    verify_email: {
      type: Boolean,
      default: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    mobile: {
      type: String,
      trim: true,
      default: undefined,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    lastLoginAt: Date,

    /* ---------- SECURITY ---------- */
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },

    forgotPasswordOtpHash: { type: String, select: false },
    forgotPasswordExpiry: { type: Date, select: false },

    /* ---------- META ---------- */
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

/* ================= CRITICAL INDEX FIX ================= */
/**
 * Enforces:
 * - staffPin unique PER restaurant
 * - ONLY when staffPin exists
 * - managers & admins are ignored
 */
userSchema.index(
  { restaurantId: 1, staffPin: 1, staffCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      staffPin: { $type: "string" },
    },
  }
);

userSchema.index(
  { mobile: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: {
      mobile: { $type: "string" },
    },
  }
);

/* ================= STAFF PIN GENERATOR ================= */

userSchema.statics.generateStaffPin = async function (restaurantId) {
  const MAX_ATTEMPTS = 12;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const exists = await this.findOne({
      restaurantId,
      staffPin: pin,
    }).lean();

    if (!exists) return pin;
  }

  throw new Error("Unable to generate unique staff PIN");
};

/* ================= PLUGINS ================= */

userSchema.plugin(mongoosePaginate);

/* ================= MODEL ================= */

const User = mongoose.model("User", userSchema);
export default User;
