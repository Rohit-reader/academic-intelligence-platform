const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['WORKSHOP', 'PLACEMENT', 'SEMINAR', 'CULTURAL', 'CONFERENCE', 'OTHER'],
      default: 'WORKSHOP',
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    organizer: { type: String, required: true },
    affectedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    affectedFaculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
