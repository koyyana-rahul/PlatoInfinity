import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import crypto from "crypto";
const sessionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    openedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tablePin: { type: String, required: true },

    /* ========== 🪑 MODE: FAMILY vs INDIVIDUAL ========== */
    mode: {
      type: String,
      enum: ["FAMILY", "INDIVIDUAL"],
      default: "FAMILY",
      description:
        "FAMILY = shared cart, INDIVIDUAL = separate carts per device",
    },

    sessionTokenHash: { type: String, select: false },
    tokenExpiresAt: { type: Date, default: null },

    /* ========== 🔑 CUSTOMER TOKENS (for QR/PIN join) ========== */
    customerTokens: [
      {
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        lastActivityAt: { type: Date, default: Date.now },
        deviceId: { type: String, default: null }, // Track which device for INDIVIDUAL mode
      },
    ],

    /* ========== 🔐 PIN ATTEMPT TRACKING ========== */
    pinAttempts: [
      {
        pin: { type: String, required: true },
        attempt: { type: Number, required: true }, // 1, 2, 3...
        timestamp: { type: Date, default: Date.now },
        isCorrect: { type: Boolean, required: true },
      },
    ],
    pinBlockedUntil: {
      type: Date,
      default: null,
      description: "Session PIN locked after 5 failed attempts for 15 minutes",
    },
    pinFailedCount: {
      type: Number,
      default: 0,
      description: "Consecutive failed PIN attempts. Reset on correct PIN",
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
      index: true,
    },
    currentTableId: { type: Schema.Types.ObjectId, ref: "Table" },
    startedAt: { type: Date, default: Date.now },
    closedAt: Date,
    lastActivityAt: { type: Date, default: Date.now },
    customerPhone: { type: String, default: null },
    whatsappVerified: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

sessionSchema.index(
  { restaurantId: 1, tableId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "OPEN" } },
);

/* ========== CREATE SESSION FOR TABLE ========== */
sessionSchema.statics.createForTable = async function (
  { restaurantId, tableId, openedByUserId, mode = "FAMILY" },
  session = null,
) {
  const tablePin = Math.floor(1000 + Math.random() * 9000).toString();
  const token = crypto.randomBytes(24).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const doc = new this({
    restaurantId,
    tableId,
    openedByUserId,
    mode, // ✅ SET MODE
    tablePin,
    sessionTokenHash: tokenHash,
    tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8), // default 8 hours
    currentTableId: tableId,
  });
  if (session) await doc.save({ session });
  else await doc.save();
  return { sessionDoc: doc, token };
};

/* ========== CHECK IF PIN IS BLOCKED ========== */
sessionSchema.methods.isPinBlocked = function () {
  if (!this.pinBlockedUntil) return false;
  if (this.pinBlockedUntil < new Date()) {
    // Unblock if time has passed
    this.pinBlockedUntil = null;
    return false;
  }
  return true;
};

/* ========== RECORD PIN ATTEMPT ========== */
sessionSchema.methods.recordPinAttempt = async function (
  enteredPin,
  isCorrect,
) {
  const PIN_MAX_ATTEMPTS = 5;
  const PIN_BLOCK_DURATION_MINUTES = 15;

  this.pinAttempts.push({
    pin: enteredPin,
    attempt: this.pinAttempts.length + 1,
    timestamp: new Date(),
    isCorrect,
  });

  if (isCorrect) {
    // ✅ CORRECT: Reset failed count
    this.pinFailedCount = 0;
    this.pinBlockedUntil = null;
  } else {
    // ❌ WRONG: Increment failed count
    this.pinFailedCount += 1;
    if (this.pinFailedCount >= PIN_MAX_ATTEMPTS) {
      // Block PIN for 15 minutes
      this.pinBlockedUntil = new Date(
        Date.now() + PIN_BLOCK_DURATION_MINUTES * 60 * 1000,
      );
    }
  }

  await this.save();
};

/* ========== VERIFY PIN (WITH RATE LIMITING) ========== */
sessionSchema.methods.verifyPin = async function (enteredPin) {
  // 🔐 CHECK BLOCKING
  if (this.isPinBlocked()) {
    const blockTimeLeft = Math.ceil(
      (this.pinBlockedUntil - new Date()) / 1000 / 60,
    );
    await this.recordPinAttempt(enteredPin, false);
    return {
      success: false,
      message: `Too many attempts. Try again in ${blockTimeLeft} minutes`,
      isBlocked: true,
    };
  }

  const isCorrect = this.tablePin === String(enteredPin);
  await this.recordPinAttempt(enteredPin, isCorrect);

  if (isCorrect) {
    return { success: true, message: "PIN verified" };
  } else {
    const attemptsLeft = 5 - this.pinFailedCount;
    return {
      success: false,
      message: `Invalid PIN. ${attemptsLeft} attempts remaining`,
      attemptsLeft,
    };
  }
};

sessionSchema.methods.verifySessionToken = function (rawToken) {
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  if (this.sessionTokenHash !== hash) return false;
  if (this.tokenExpiresAt && this.tokenExpiresAt < new Date()) return false;
  if (this.status !== "OPEN") return false;
  return true;
};

sessionSchema.plugin(mongoosePaginate);

const sessionModel = mongoose.model("Session", sessionSchema);

export default sessionModel;
