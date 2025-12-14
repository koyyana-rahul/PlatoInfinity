import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const OrderItemSchema = new mongoose.Schema(
  {
    branchMenuItemId: {
      type: Schema.Types.ObjectId,
      ref: "BranchMenuItem",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedModifiers: [{ title: String, optionName: String, price: Number }],
    station: { type: String, default: null },
    itemStatus: {
      type: String,
      enum: ["NEW", "IN_PROGRESS", "READY", "SERVED", "CANCELLED"],
      default: "NEW",
      index: true,
    },
    chefId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    waiterId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    claimedAt: Date,
    readyAt: Date,
    servedAt: Date,
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    tableName: { type: String, required: true },
    items: { type: [OrderItemSchema], default: [] },
    orderStatus: {
      type: String,
      enum: ["OPEN", "PENDING_APPROVAL", "APPROVED", "PAID", "CANCELLED"],
      default: "OPEN",
      index: true,
    },
    isSuspicious: { type: Boolean, default: false },
    suspiciousReason: { type: String, default: null },
    totalAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI_IN_APP", "SPLIT", null],
      default: null,
    },
    closedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    closedAt: Date,
    externalPaymentRef: { type: String, index: true },
    clientRequestId: { type: String, default: null }, // idempotency
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    let total = 0;
    for (const it of this.items) {
      if (!it) continue;
      if (it.itemStatus === "CANCELLED") continue;
      const mods = (it.selectedModifiers || []).reduce(
        (s, m) => s + (m.price || 0),
        0
      );
      total += (it.price + mods) * (it.quantity || 1);
    }
    this.totalAmount = total;
  }
  next();
});

orderSchema.plugin(mongoosePaginate);
const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
