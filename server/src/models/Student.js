const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    semester: { type: Number, required: true, default: 1 },
    batch: { type: String, required: true }, // e.g. "2023-2027"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
