const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    contextType: {
      type: String,
      enum: ['LEAVE_SUBSTITUTION', 'TIMETABLE_OPTIMIZATION', 'ROOM_ALLOCATION', 'SIMULATION_ALTERNATIVE'],
      required: true,
    },
    problemDescription: { type: String, required: true },
    scenariosEvaluated: [
      {
        id: { type: String },
        title: { type: String },
        score: { type: Number },
        conflictsCount: { type: Number },
        explanation: [String],
        impactSummary: { type: String },
      },
    ],
    recommendedScenarioId: { type: String, required: true },
    overallQualityScore: { type: Number, default: 95 },
    humanExplanation: { type: String, required: true },
    status: { type: String, enum: ['PROPOSED', 'ACCEPTED', 'REJECTED'], default: 'PROPOSED' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
