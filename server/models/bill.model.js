import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const billItemSchema = new mongoose.Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    orderItemIndex: Number,
    name: String,
    quantity: Number,
    rate: Number,
    taxPercent: Number,
    lineTotal: Number,
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    items: { type: [BillItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    customerPhone: { type: String, default: null },
    whatsappVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["OPEN", "PAID", "REFUNDED"],
      default: "OPEN",
      index: true,
    },
    closedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    closedAt: Date,
    externalInvoiceUrl: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

billSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    let subtotal = 0,
      taxes = 0;
    for (const it of this.items) {
      subtotal += (it.rate || 0) * (it.quantity || 0);
      taxes +=
        ((it.taxPercent || 0) / 100) * (it.rate || 0) * (it.quantity || 0);
    }
    this.subtotal = subtotal;
    this.taxes = taxes;
    this.total =
      subtotal + taxes + (this.serviceCharge || 0) - (this.discounts || 0);
  }
  next();
});

billSchema.plugin(mongoosePaginate);

const billModel = mongoose.model("Bill", billSchema);

export default billModel;
