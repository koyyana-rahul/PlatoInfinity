const kitchenStationSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    deviceId: { type: String, default: null },
    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

kitchenStationSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
kitchenStationSchema.plugin(mongoosePaginate);

const kitchenStationModel = mongoose.model(
  "KitchenStation",
  kitchenStationSchema
);
export default kitchenStationModel;
