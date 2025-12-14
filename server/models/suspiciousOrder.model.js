import mongoose, {Schema} from "mongoose";  
import mongoosePaginate from "mongoose-paginate-v2";
const suspiciousOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    reason: { type: String, required: true },
    flaggedAt: { type: Date, default: Date.now },
    flaggedBy: { type: String, default: "SYSTEM" },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    resolvedAt: Date,
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    notes: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

suspiciousOrderSchema.plugin(mongoosePaginate);

const suspiciousOrderModel = mongoose.model(
  "SuspiciousOrder",
  suspiciousOrderSchema
);
export default suspiciousOrderModel;
