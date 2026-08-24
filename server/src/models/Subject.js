const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    credits: { type: Number, required: true, default: 3 },
    weeklyPeriods: { type: Number, required: true, default: 3 },
    requiresLab: { type: Boolean, default: false },
    semester: { type: Number, required: true, default: 1 },
    type: { type: String, enum: ['CORE', 'ELECTIVE', 'LAB', 'VALUE_ADDED'], default: 'CORE' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
