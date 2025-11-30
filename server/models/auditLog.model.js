const auditLogSchema = new mongoose.Schema(
  {
    actorType: { type: String, enum: ["USER", "SYSTEM"], required: true },
    actorId: { type: String, default: null },
    action: { type: String, required: true },
    entityType: { type: String, default: null },
    entityId: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.plugin(mongoosePaginate);
const auditLogModel = mongoose.model("AuditLog", auditLogSchema);

export default auditLogModel;
