import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    timezone: { type: String, default: "Asia/Kolkata" },
    isArchived: { type: Boolean, default: false },
    settings: {
      maxItemQuantity: { type: Number, default: 10 },
      maxOrderValue: { type: Number, default: 8000 },
      allowInAppPayment: { type: Boolean, default: false },
      suspiciousOrder: {
        maxQtyThreshold: { type: Number, default: 20 },
        maxAmountThreshold: { type: Number, default: 20000 },
      },
    },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

restaurantSchema.index(
  { brandId: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
restaurantSchema.index(
  { brandId: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $ne: "" } } }
);

restaurantSchema.plugin(mongoosePaginate);
const restaurantModel = mongoose.model("Restaurant", restaurantSchema);

export default restaurantModel;
