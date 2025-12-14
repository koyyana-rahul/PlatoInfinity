import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const cashEntrySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    shiftId: { type: Schema.Types.ObjectId, ref: "Shift", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["COLLECTION", "PAYOUT"],
      default: "COLLECTION",
    },
    reference: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);
cashEntrySchema.plugin(mongoosePaginate);
const cashEntryModel = mongoose.model("CashEntry", cashEntrySchema);

export default cashEntryModel;
