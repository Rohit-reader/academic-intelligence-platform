const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema(
  {
    timetable: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable', required: true },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true }, // e.g. "09:00"
    endTime: { type: String, required: true },   // e.g. "10:00"
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    laboratory: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory' },
    isLabSession: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
