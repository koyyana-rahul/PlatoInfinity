import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableNumber: { type: String, required: true },
    name: { type: String, default: null },
    seatingCapacity: { type: Number, default: 4 },
    qrUrl: {
      type: String, // 👈 important
    },
    qrImageUrl: {
      type: String, // 👈 cloudinary image
    },
    status: {
      type: String,
      enum: ["FREE", "OCCUPIED", "RESERVED"],
      default: "FREE",
    },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
tableSchema.plugin(mongoosePaginate);

export default mongoose.models.Table || mongoose.model("Table", tableSchema);
