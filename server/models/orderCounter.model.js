import mongoose, { Schema } from "mongoose";

const orderCounterSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
      index: true,
    },
    seq: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

const OrderCounter = mongoose.model("OrderCounter", orderCounterSchema);
export default OrderCounter;
