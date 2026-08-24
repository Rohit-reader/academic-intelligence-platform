const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    building: { type: String, default: 'Main Building' },
    contactEmail: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
