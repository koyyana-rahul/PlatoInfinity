import mongoose from "mongoose";

const reportCacheSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    metrics: { type: Schema.Types.Mixed, default: {} },
    lastComputedAt: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

reportCacheSchema.index({ restaurantId: 1, date: 1 }, { unique: true });

const reportCacheModel = mongoose.model("ReportCache", reportCacheSchema);

export default reportCacheModel;
