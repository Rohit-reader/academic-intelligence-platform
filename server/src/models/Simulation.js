const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    hypotheticals: {
      absentFacultyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
      blockedRoomIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
      newEvent: {
        title: { type: String },
        date: { type: Date },
        startTime: { type: String },
        endTime: { type: String },
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
      },
    },
    scenarios: [
      {
        scenarioId: { type: String },
        name: { type: String },
        changes: [{ type: String }],
        conflictsCount: { type: Number },
        score: { type: Number },
        explanation: [String],
        isRecommended: { type: Boolean, default: false },
      },
    ],
    status: { type: String, enum: ['SIMULATED', 'APPLIED', 'DISCARDED'], default: 'SIMULATED' },
    appliedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Simulation', simulationSchema);
