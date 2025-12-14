import mongoose, {Schema} from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";  
const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableNumber: { type: Number, required: true },
    name: { type: String, default: null },
    seatingCapacity: { type: Number, default: 4 },
    qrCodePath: { type: String, default: "" },
    status: {
      type: String,
      enum: ["FREE", "OCCUPIED", "RESERVED"],
      default: "FREE",
    },
    isArchived: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

tableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });
tableSchema.plugin(mongoosePaginate);

const tableModel = mongoose.model("Table", tableSchema);

export default tableModel;
