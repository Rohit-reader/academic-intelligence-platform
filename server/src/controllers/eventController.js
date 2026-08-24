const Event = require('../models/Event');
const { sendSuccess, sendError } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('classroom affectedSections affectedFaculty')
      .sort({ date: 1 });
    return sendSuccess(res, events);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    await logAudit(req, 'EVENT_CREATE', 'EVENT', event._id.toString(), `Created event ${event.title} (${event.type})`);
    return sendSuccess(res, event, 'Event created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  getEvents,
  createEvent,
};
