import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "provide name"], trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      required: function () {
        return this.role === "BRAND_ADMIN" || this.role === "MANAGER";
      },
    },
    password: { type: String, select: false },
    staffPin: { type: String, select: false, sparse: true }, // 4-digit PIN, unique per restaurant
    role: {
      type: String,
      enum: ["BRAND_ADMIN", "MANAGER", "CHEF", "WAITER", "CASHIER"],
      required: true,
      index: true,
    },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      index: true,
    },
    kitchenStationId: {
      type: Schema.Types.ObjectId,
      ref: "KitchenStation",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    mobile: { type: String, trim: true },
    refreshToken: { type: String, select: false },
    verifyEmail: { type: Boolean, default: false },
    lastLoginAt: Date,
    forgotPasswordOtpHash: { type: String, select: false },
    forgotPasswordExpiry: { type: Date, select: false },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

UserSchema.index(
  { restaurantId: 1, staffPin: 1 },
  { unique: true, sparse: true }
);

// helper to generate a staff pin
UserSchema.statics.generateStaffPin = async function (restaurantId) {
  const maxAttempts = 12;
  for (let i = 0; i < maxAttempts; i++) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const exists = await this.findOne({ restaurantId, staffPin: pin }).lean();
    if (!exists) return pin;
  }
  throw new Error("Unable to generate unique staff PIN");
};

UserSchema.plugin(mongoosePaginate);
const userModel = mongoose.model("User", userSchema);

export default userModel;
