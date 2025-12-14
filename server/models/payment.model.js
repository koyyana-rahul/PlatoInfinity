import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const paymentSchema = new mongoose.Schema(
  {
    billId: {
      type: Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ["CASH", "CARD", "UPI_IN_APP", "SPLIT"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    txnRef: { type: String, index: true },
    provider: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.plugin(mongoosePaginate);

const paymentModel = mongoose.model("Payment", paymentSchema);

export default paymentModel;
