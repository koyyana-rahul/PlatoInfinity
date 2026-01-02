import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const restaurantSchema = new Schema(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    // BASIC INFO
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },

    // ADDRESS
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },

    timezone: { type: String, default: "Asia/Kolkata" },

    // SETTINGS (VERY IMPORTANT)
    settings: {
      maxItemQuantity: { type: Number, default: 10 },
      maxOrderValue: { type: Number, default: 8000 },
      allowInAppPayment: { type: Boolean, default: false },

      suspiciousOrder: {
        maxQtyThreshold: { type: Number, default: 20 },
        maxAmountThreshold: { type: Number, default: 20000 },
      },
    },

    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// UNIQUE BRANCH NAME PER BRAND
restaurantSchema.index(
  { brandId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// OPTIONAL PHONE UNIQUENESS
restaurantSchema.index(
  { brandId: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $ne: "" } } }
);

restaurantSchema.plugin(mongoosePaginate);

export default mongoose.model("Restaurant", restaurantSchema);
