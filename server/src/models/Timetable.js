const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Default Timetable' },
    academicYear: { type: String, required: true, default: '2025-2026' },
    semester: { type: Number, required: true, default: 1 },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    status: { type: String, enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
