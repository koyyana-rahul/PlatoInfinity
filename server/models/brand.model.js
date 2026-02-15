import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    logoUrl: { type: String, default: "" },
    timezone: { type: String, default: "Asia/Kolkata" },
    defaultTaxes: [{ name: String, percent: Number }],

    // Additional settings fields
    storeName: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    description: { type: String, trim: true },
    gst: { type: String, trim: true },
    fssai: { type: String, trim: true },
    serviceCharge: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

const brandModel = mongoose.model("Brand", brandSchema);
export default brandModel;
