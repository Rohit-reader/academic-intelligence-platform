const mongoose = require('mongoose');

const securityAlertSchema = new mongoose.Schema(
  {
    alertType: { type: String, required: true }, // e.g. "EXCESSIVE_TIMETABLE_CHANGES", "MULTIPLE_FAILED_LOGINS", "UNAUTHORIZED_ACCESS"
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String, default: '' },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    description: { type: String, required: true },
    ipAddress: { type: String, default: '127.0.0.1' },
    status: { type: String, enum: ['OPEN', 'INVESTIGATING', 'RESOLVED'], default: 'OPEN' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SecurityAlert', securityAlertSchema);
