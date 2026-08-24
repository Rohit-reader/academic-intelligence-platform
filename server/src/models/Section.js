const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "CSE-A", "ECE-B"
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true, default: 1 },
    academicYear: { type: String, required: true, default: '2025-2026' },
    studentCount: { type: Number, default: 60 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Section', sectionSchema);
