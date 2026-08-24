const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    substituteFaculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    aiRecommendation: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewComments: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
