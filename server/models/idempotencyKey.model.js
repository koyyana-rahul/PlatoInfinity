import mongoose, {Schema} from "mongoose";
const idempotencySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    default: null,
  },
  pending: { type: Boolean, default: false },
  suspiciousId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "suspiciousorder",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("idempotencykey", idempotencySchema);
