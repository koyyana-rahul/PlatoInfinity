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
    sessionTokenHash: { type: String, select: false },
    tokenExpiresAt: { type: Date, default: null },
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
  { timestamps: true }
);

sessionSchema.index({ restaurantId: 1, tableId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "OPEN" } });

sessionSchema.statics.createForTable = async function({ restaurantId, tableId, openedByUserId }, session = null) {
  const tablePin = (Math.floor(1000 + Math.random()*9000)).toString();
  const token = crypto.randomBytes(24).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const doc = new this({
    restaurantId,
    tableId,
    openedByUserId,
    tablePin,
    sessionTokenHash: tokenHash,
    tokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8), // default 8 hours
    currentTableId: tableId
  });
  if (session) await doc.save({ session });
  else await doc.save();
  return { sessionDoc: doc, token };
};

sessionSchema.methods.verifySessionToken = function(rawToken) {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  if (this.sessionTokenHash !== hash) return false;
  if (this.tokenExpiresAt && this.tokenExpiresAt < new Date()) return false;
  if (this.status !== "OPEN") return false;
  return true;
};

sessionSchema.plugin(mongoosePaginate);

const sessionModel = mongoose.model("Session", sessionSchema);

export default sessionModel;
