import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const waiterAlertSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      enum: ["GENERAL", "TABLE_PIN", "BILL_REQUEST"],
      default: "GENERAL",
      index: true,
    },
    // Alert status
    status: {
      type: String,
      enum: ["PENDING", "ATTENDED"],
      default: "PENDING",
      index: true,
    },
    // Which waiter acknowledged this alert
    attendedByWaiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    attendedAt: {
      type: Date,
      default: null,
    },
    // For audit trail
    createdBySessionId: {
      type: String,
      default: null,
    },
    // Time slot grouping (for reporting)
    dateSlot: {
      type: String, // Format: "2026-03-06" (YYYY-MM-DD)
      required: true,
      index: true,
    },
    timeSlot: {
      type: String, // Format: "14:00-15:00" or hourly bucket
      required: true,
      index: true,
    },
    // Response time tracking
    responseTimeMs: {
      type: Number,
      default: null, // Set when attended
    },
  },
  { timestamps: true },
);

// Compound index for efficient time-based queries
waiterAlertSchema.index({ restaurantId: 1, dateSlot: 1, timeSlot: 1 });
waiterAlertSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
waiterAlertSchema.index({ restaurantId: 1, alertType: 1, createdAt: -1 });

waiterAlertSchema.plugin(mongoosePaginate);

const waiterAlertModel = mongoose.model("WaiterAlert", waiterAlertSchema);

export default waiterAlertModel;
