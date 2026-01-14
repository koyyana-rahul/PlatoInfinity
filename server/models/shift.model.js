import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/* ================= SHIFT SCHEMA ================= */

const shiftSchema = new Schema(
  {
    /* ---------- OWNER (MANAGER / CASHIER) ---------- */
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Manager / Cashier
      required: true,
      index: true,
    },

    /* ---------- RESTAURANT ---------- */
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    /* ---------- SHIFT TYPE ---------- */
    shiftType: {
      type: String,
      enum: ["STAFF", "CASH", "BOTH"],
      default: "STAFF",
      index: true,
    },

    /* ---------- TIME ---------- */
    openedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
      index: true,
    },

    /* ---------- CASH MANAGEMENT ---------- */
    openedCash: {
      type: Number,
      default: 0,
    },

    closedCash: {
      type: Number,
      default: 0,
    },

    /* ---------- QR LOGIN (CRITICAL) ---------- */
    qrToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    qrExpiresAt: {
      type: Date,
      index: true,
    },

    qrIsActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* ---------- STAFF ATTENDANCE ---------- */
    staffLogins: [
      {
        staffId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        role: {
          type: String,
          enum: ["CHEF", "WAITER", "CASHIER"],
          required: true,
        },

        loggedInAt: {
          type: Date,
          default: Date.now,
        },

        loggedOutAt: {
          type: Date,
          default: null,
        },
      },
    ],

    /* ---------- NOTES ---------- */
    notes: {
      type: String,
      default: "",
    },

    /* ---------- META ---------- */
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

/* ================= IMPORTANT INDEXES ================= */

/**
 * ✔ Enforce ONLY ONE OPEN shift per restaurant
 */
shiftSchema.index(
  { restaurantId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "OPEN" },
  }
);

/**
 * ✔ Auto-expire QR after qrExpiresAt
 * MongoDB TTL index
 */
shiftSchema.index({ qrExpiresAt: 1 }, { expireAfterSeconds: 0 });

/* ================= PLUGINS ================= */

shiftSchema.plugin(mongoosePaginate);

/* ================= MODEL ================= */

const Shift = mongoose.model("Shift", shiftSchema);
export default Shift;
