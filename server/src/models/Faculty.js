const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true, default: 'Assistant Professor' }, // Professor, Assoc Professor, Asst Professor
    specializations: [{ type: String }],
    maxWeeklyWorkload: { type: Number, default: 18 }, // max hours per week
    currentWorkload: { type: Number, default: 0 },
    preferredRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }],
    availability: {
      type: Map,
      of: [String], // Day -> ["09:00-10:00", "10:00-11:00"]
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);
