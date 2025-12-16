import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * ==========================
 * BILL ITEM (ORDER SNAPSHOT)
 * ==========================
 */
const billItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    orderItemIndex: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    taxPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * ==========================
 * BILL SCHEMA
 * ==========================
 */
const billSchema = new mongoose.Schema(
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
      unique: true, // 🚨 ONE BILL PER SESSION
    },

    items: {
      type: [billItemSchema],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Bill must contain at least one item",
      },
    },

    /**
     * ==========
     * AMOUNTS
     * ==========
     */
    subtotal: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    /**
     * ==========
     * PAYMENT
     * ==========
     */
    status: {
      type: String,
      enum: ["OPEN", "PAID", "REFUNDED"],
      default: "OPEN",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "ONLINE"],
      default: null,
    },

    paymentReference: {
      type: String,
      default: null, // UPI txn id / gateway ref
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    /**
     * ==========
     * CUSTOMER
     * ==========
     */
    customerPhone: {
      type: String,
      default: null,
      index: true,
    },

    whatsappSent: {
      type: Boolean,
      default: false,
    },

    whatsappVerified: {
      type: Boolean,
      default: false,
    },

    /**
     * ==========
     * STAFF
     * ==========
     */
    closedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    /**
     * ==========
     * EXTERNAL
     * ==========
     */
    externalInvoiceUrl: {
      type: String,
      default: null,
    },

    /**
     * ==========
     * META
     * ==========
     */
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

/**
 * ==========================
 * AUTO CALCULATIONS
 * ==========================
 */
billSchema.pre("save", function (next) {
  if (!this.isModified("items")) return next();

  let subtotal = 0;
  let taxes = 0;

  for (const it of this.items) {
    const itemTotal = (it.rate || 0) * (it.quantity || 0);
    const itemTax =
      ((it.taxPercent || 0) / 100) * itemTotal;

    subtotal += itemTotal;
    taxes += itemTax;

    it.lineTotal = itemTotal + itemTax;
  }

  this.subtotal = subtotal;
  this.taxes = taxes;

  this.total =
    subtotal +
    taxes +
    (this.serviceCharge || 0) -
    (this.discounts || 0);

  next();
});

/**
 * ==========================
 * SAFETY HOOKS
 * ==========================
 */
billSchema.pre("save", function (next) {
  if (this.status === "PAID") {
    if (!this.paymentMethod || !this.paidAt) {
      return next(
        new Error("Paid bill must have paymentMethod and paidAt")
      );
    }
    if (this.paidAmount < this.total) {
      return next(new Error("Paid amount less than total"));
    }
  }
  next();
});

/**
 * ==========================
 * INDEXES
 * ==========================
 */
billSchema.index({ restaurantId: 1, status: 1 });
billSchema.index({ createdAt: -1 });

billSchema.plugin(mongoosePaginate);

const BillModel = mongoose.model("Bill", billSchema);

export default BillModel;
