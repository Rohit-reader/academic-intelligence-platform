const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Mid-Sem Fall 2026"
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g. "10:00"
    endTime: { type: String, required: true },   // e.g. "13:00"
    totalStudents: { type: Number, default: 0 },
    status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Examination', examinationSchema);
