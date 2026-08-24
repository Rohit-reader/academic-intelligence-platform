const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    building: { type: String, required: true, default: 'Main Building' },
    floor: { type: Number, default: 1 },
    capacity: { type: Number, required: true, default: 60 },
    isLab: { type: Boolean, default: false },
    facilities: [{ type: String }], // 'PROJECTOR', 'SMART_BOARD', 'AC', 'AUDIO_SYSTEM'
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Classroom', classroomSchema);
