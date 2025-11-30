import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const shiftSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    openedAt: { type: Date, default: Date.now },
    closedAt: Date,
    openedCash: { type: Number, default: 0 },
    closedCash: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

shiftSchema.plugin(mongoosePaginate);

const shiftModel = mongoose.model("Shift", shiftSchema);
export default shiftModel;
