const refundSchema = new mongoose.Schema(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment", required: true },
    amount: { type: Number, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["REQUESTED", "COMPLETED", "FAILED"],
      default: "REQUESTED",
    },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: Date,
    providerResponse: { type: Schema.Types.Mixed, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

refundSchema.plugin(mongoosePaginate);
const refundModel = mongoose.model("Refund", refundSchema);
export default refundModel;
