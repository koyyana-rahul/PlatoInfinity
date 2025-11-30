const kitchenActivitySchema = new mongoose.Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderItemIndex: { type: Number, required: true },
    station: { type: String, required: true },
    chefId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: {
      type: String,
      enum: ["ENQUEUED", "CLAIMED", "READY", "DEQUEUED"],
      required: true,
    },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

kitchenActivitySchema.plugin(mongoosePaginate);
const kitchenActivityModel = mongoose.model(
  "KitchenActivity",
  kitchenActivitySchema
);
export default kitchenActivityModel;
