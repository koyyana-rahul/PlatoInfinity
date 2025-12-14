import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const stockSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    branchMenuItemId: {
      type: Schema.Types.ObjectId,
      ref: "BranchMenuItem",
      required: true,
      index: true,
    },
    stockQty: { type: Number, default: null }, // null = unlimited
    unit: { type: String, default: "pcs" },
    autoHideWhenZero: { type: Boolean, default: true },
    lastAdjustedAt: { type: Date, default: Date.now },
    lastAdjustedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

stockSchema.index({ restaurantId: 1, branchMenuItemId: 1 }, { unique: true });
stockSchema.plugin(mongoosePaginate);

/**
 * Atomic decrement helper. Returns { success, newQty }.
 * Use inside a MongoDB transaction if decrementing multiple items.
 */
stockSchema.statics.decrementIfAvailable = async function(branchMenuItemId, restaurantId, qty = 1, session = null) {
  // allow unlimited (stockQty === null)
  const query = {
    branchMenuItemId,
    restaurantId,
    $or: [{ stockQty: null }, { stockQty: { $gte: qty } }]
  };
  const update = {
    $inc: { stockQty: typeof qty === "number" ? -qty : -1 },
    $set: { lastAdjustedAt: new Date() }
  };
  const opts = { new: true };
  if (session) opts.session = session;
  const res = await this.findOneAndUpdate(query, update, opts).lean();
  if (!res) return { success: false, newQty: null };
  return { success: true, newQty: res.stockQty };
};
const stockModel = mongoose.model("Stock", stockSchema);

export default stockModel;
