import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const restaurantSchema = new Schema(
  {
    /* ================= OWNERSHIP ================= */
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    /* ================= ADDRESS (HUMAN READABLE) ================= */
    addressText: {
      type: String,
      required: true,
      trim: true,
    },

    /* ================= GOOGLE PLACE ================= */
    placeId: {
      type: String,
      required: true,
      index: true,
    },

    /* ================= GEO LOCATION (CRITICAL) ================= */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    /* ================= MANAGERS ================= */
    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    /* ================= SETTINGS ================= */
    settings: {
      maxItemQuantity: { type: Number, default: 10 },
      maxOrderValue: { type: Number, default: 8000 },
      allowInAppPayment: { type: Boolean, default: false },

      suspiciousOrder: {
        maxQtyThreshold: { type: Number, default: 20 },
        maxAmountThreshold: { type: Number, default: 20000 },
      },
    },

    /* ================= STATUS ================= */
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

// Unique restaurant name per brand
restaurantSchema.index(
  { brandId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// Geo index (MOST IMPORTANT)
restaurantSchema.index({ location: "2dsphere" });

// Optional phone uniqueness
restaurantSchema.index(
  { brandId: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $ne: "" } } }
);

restaurantSchema.plugin(mongoosePaginate);

export default mongoose.model("Restaurant", restaurantSchema);
