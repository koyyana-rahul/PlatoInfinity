import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import crypto from "crypto";
const whatsappVerificationSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    otpHash: { type: String, required: true, select: false },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", default: null },
    billId: { type: Schema.Types.ObjectId, ref: "Bill", default: null },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

whatsappVerificationSchema.index({ phone: 1, sessionId: 1 });
whatsappVerificationSchema.statics.hashOtp = function (otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

whatsappVerificationSchema.plugin(mongoosePaginate);
const whatsappVerificationModel = mongoose.model(
  "WhatsappVerification",
  whatsappVerificationSchema
);
export default whatsappVerificationModel;
