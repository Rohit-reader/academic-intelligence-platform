const mongoose = require('mongoose');

const examRoomAllocationSchema = new mongoose.Schema(
  {
    examination: { type: mongoose.Schema.Types.ObjectId, ref: 'Examination', required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    allocatedStudentsCount: { type: Number, required: true, default: 30 },
    invigilator: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExamRoomAllocation', examRoomAllocationSchema);
