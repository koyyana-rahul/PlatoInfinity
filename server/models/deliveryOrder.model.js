import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const DeliveryOrderItemSchema = new mongoose.Schema(
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
    itemStatus: {
      type: String,
      enum: [
        "NEW",
        "IN_PROGRESS",
        "READY",
        "PACKED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "NEW",
      index: true,
    },
    chefId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    claimedAt: Date,
    readyAt: Date,
    packedAt: Date,
  },
  { timestamps: true },
);

const deliveryOrderSchema = new mongoose.Schema(
  {
    // Order Identification
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      // Format: PLD-{timestamp}-{random}
      // Example: PLD-1705900800000-AB12
    },

    // Platform Integration (Swiggy, Zomato, etc.)
    platform: {
      type: String,
      enum: ["SWIGGY", "ZOMATO", "CUSTOM", "OWN_PLATFORM"],
      default: "OWN_PLATFORM",
      index: true,
    },
    platformOrderId: {
      type: String,
      default: null,
      // External platform's order ID (Swiggy ID, Zomato ID, etc.)
    },
    platformOrderRef: {
      type: String,
      default: null,
      // Reference for API callbacks
    },

    // Customer Information
    customerName: { type: String, required: true },
    customerPhone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone must be 10 digits",
      },
    },
    customerEmail: { type: String, default: null },

    // Delivery Address
    deliveryAddress: {
      fullAddress: { type: String, required: true },
      coordinates: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      landmark: { type: String, default: null },
      instructions: { type: String, default: null },
    },

    // Items in Order
    items: {
      type: [DeliveryOrderItemSchema],
      default: [],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    // Pricing Details
    itemsSubtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    packagingCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment Information
    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "WALLET", "PREPAID"],
      default: "PREPAID",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    paymentRef: {
      type: String,
      default: null,
      // Payment gateway reference (Stripe, Razorpay, etc.)
    },
    paidAt: Date,
    paidByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // Order Status Tracking
    orderStatus: {
      type: String,
      enum: [
        "NEW",
        "CONFIRMED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "PICKED_UP",
        "OUT_FOR_DELIVERY",
        "NEARBY",
        "DELIVERED",
        "CANCELLED",
        "FAILED",
      ],
      default: "NEW",
      index: true,
    },

    // Status Timeline
    statusTimeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],

    // Delivery Partner Information
    deliveryPartner: {
      userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
      name: String,
      phone: String,
      rating: { type: Number, min: 1, max: 5, default: null },
      profileImage: String,
      vehicleType: {
        type: String,
        enum: ["BIKE", "SCOOTER", "CAR", "VAN"],
        default: null,
      },
      licensePlate: String,
      location: {
        latitude: Number,
        longitude: Number,
        timestamp: Date,
      },
    },

    // Delivery Tracking
    deliveryTracking: {
      pickedUpAt: Date,
      outForDeliveryAt: Date,
      nearbyNotifiedAt: Date,
      deliveredAt: Date,
      estimatedDeliveryTime: Date,
      actualDeliveryTime: Date,
      deliveryDistance: Number, // in km
      deliveryDuration: Number, // in minutes
    },

    // Special Instructions
    specialInstructions: {
      noOnion: { type: Boolean, default: false },
      noGarlic: { type: Boolean, default: false },
      extraSpicy: { type: Boolean, default: false },
      custom: { type: String, default: null },
    },

    // Feedback & Ratings
    feedback: {
      orderRating: { type: Number, min: 1, max: 5, default: null },
      deliveryRating: { type: Number, min: 1, max: 5, default: null },
      orderReview: { type: String, default: null },
      deliveryReview: { type: String, default: null },
      feedbackAt: Date,
    },

    // Additional Fields
    isScheduled: { type: Boolean, default: false },
    scheduledDeliveryTime: Date,
    cancelledReason: { type: String, default: null },
    cancelledBy: {
      type: String,
      enum: ["CUSTOMER", "RESTAURANT", "DELIVERY_PARTNER", "SYSTEM"],
      default: null,
    },
    cancelledAt: Date,
    refundStatus: {
      type: String,
      enum: ["NOT_APPLICABLE", "PENDING", "PROCESSED", "FAILED"],
      default: "NOT_APPLICABLE",
    },
    refundAmount: { type: Number, default: 0 },
    refundAt: Date,

    // Meta Information
    notes: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// Indexes for common queries
deliveryOrderSchema.index({ restaurantId: 1, createdAt: -1 });
deliveryOrderSchema.index({ restaurantId: 1, orderStatus: 1 });
deliveryOrderSchema.index({ platform: 1, platformOrderId: 1 });
deliveryOrderSchema.index({ customerPhone: 1 });
deliveryOrderSchema.index({ "deliveryPartner.userId": 1, orderStatus: 1 });
deliveryOrderSchema.index({ paymentStatus: 1 });

// Pre-save hook to calculate total and create status timeline
deliveryOrderSchema.pre("save", function (next) {
  // Calculate total
  if (
    this.isModified("itemsSubtotal") ||
    this.isModified("packagingCharges") ||
    this.isModified("deliveryCharges") ||
    this.isModified("discount") ||
    this.isModified("tax")
  ) {
    this.totalAmount =
      this.itemsSubtotal +
      this.packagingCharges +
      this.deliveryCharges +
      this.tax -
      this.discount;
  }

  // Track status changes
  if (this.isModified("orderStatus")) {
    this.statusTimeline.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }

  next();
});

// Plugin pagination
deliveryOrderSchema.plugin(mongoosePaginate);

export default mongoose.model("DeliveryOrder", deliveryOrderSchema);
