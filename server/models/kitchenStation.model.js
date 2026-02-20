import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const kitchenStationSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    badge: {
      type: String,
      default: "🍳",
      description: "Emoji badge for kitchen station (e.g., 🔥 Tandoor, 🍹 Bar)",
    },
    displayName: {
      type: String,
      default: "",
      description: "User-friendly display name (e.g., 'Tandoor Station')",
    },
    deviceId: { type: String, default: null },
    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

kitchenStationSchema.index({ restaurantId: 1, name: 1 }, { unique: true });
kitchenStationSchema.plugin(mongoosePaginate);

const kitchenStationModel = mongoose.model(
  "KitchenStation",
  kitchenStationSchema,
);
export default kitchenStationModel;
