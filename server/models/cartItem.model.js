import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    branchMenuItemId: {
      type: Schema.Types.ObjectId,
      ref: "BranchMenuItem",
      required: true,
    },

    name: String,
    price: Number,
    station: String,

    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },

    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// prevent duplicate rows
cartItemSchema.index({ sessionId: 1, branchMenuItemId: 1 }, { unique: true });

export default mongoose.model("CartItem", cartItemSchema);
