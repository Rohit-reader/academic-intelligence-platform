const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: 'SYSTEM' },
    action: { type: String, required: true }, // e.g. "USER_LOGIN", "TIMETABLE_GENERATE", "LEAVE_APPROVE"
    entity: { type: String, default: 'GENERAL' },
    entityId: { type: String, default: '' },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '127.0.0.1' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
