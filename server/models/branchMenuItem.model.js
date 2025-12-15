import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const branchMenuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    masterItemId: {
      type: Schema.Types.ObjectId,
      ref: "MasterMenuItem",
      required: true,
      index: true,
    },

    // denormalised snapshot
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    station: { type: String, default: null },
    taxPercent: { type: Number, default: 0 },

    status: { type: String, enum: ["ON", "OFF"], default: "ON" },
    trackStock: { type: Boolean, default: true },
    autoHideWhenZero: { type: Boolean, default: true },

    // master sync management
    masterDisabled: { type: Boolean, default: false },
    lastMasterVersion: { type: Number, default: 0 },
    overrides: {
      price: { type: Boolean, default: false },
      name: { type: Boolean, default: false },
      station: { type: Boolean, default: false },
      taxPercent: { type: Boolean, default: false },
    },

    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

branchMenuItemSchema.index(
  { restaurantId: 1, masterItemId: 1 },
  { unique: true }
);
branchMenuItemSchema.plugin(mongoosePaginate);

export default mongoose.models.BranchMenuItem ||
  mongoose.model("BranchMenuItem", branchMenuItemSchema);
