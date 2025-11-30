const sessionTokenSchema = new mongoose.Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

sessionTokenSchema.plugin(mongoosePaginate);

const sessionTokenModel = mongoose.model("SessionToken", sessionTokenSchema);

export default sessionTokenModel;
