const stationQueueEventSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },
    station: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderItemIndex: { type: Number, required: true },
    event: {
      type: String,
      enum: ["ENQUEUED", "CLAIMED", "READY", "DEQUEUED"],
      required: true,
    },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

stationQueueEventSchema.plugin(mongoosePaginate);
const stationQueueEventModel = mongoose.model(
  "StationQueueEvent",
  stationQueueEventSchema
);
export default stationQueueEventModel;
