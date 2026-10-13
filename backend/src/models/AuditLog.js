const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null },
  action: { type: String, enum: ["create", "update", "delete", "import", "export", "login", "upgrade"], required: true },
  entityType: { type: String, required: true }, // "activity", "organization", "evidence", "report"
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  description: { type: String, default: "" },
  before: { type: Object, default: null }, // Previous state (for updates/deletes)
  after: { type: Object, default: null },  // New state (for creates/updates)
  metadata: { type: Object, default: {} }, // Extra context (IP, user agent, etc.)
  createdAt: { type: Date, default: Date.now },
});

AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
