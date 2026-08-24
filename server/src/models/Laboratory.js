const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, uppercase: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    capacity: { type: Number, required: true, default: 30 },
    equipmentList: [{ type: String }],
    labAssistant: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Laboratory', laboratorySchema);
