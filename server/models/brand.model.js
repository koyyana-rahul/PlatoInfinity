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
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const brandModel = mongoose.model("Brand", brandSchema);
export default brandModel;
