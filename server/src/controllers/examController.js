const Examination = require('../models/Examination');
const ExamRoomAllocation = require('../models/ExamRoomAllocation');
const Classroom = require('../models/Classroom');
const { sendSuccess, sendError } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

const getExams = async (req, res) => {
  try {
    const exams = await Examination.find()
      .populate('subject department')
      .sort({ date: 1 });
    return sendSuccess(res, exams);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const createExam = async (req, res) => {
  try {
    const exam = await Examination.create(req.body);
    await logAudit(req, 'EXAM_CREATE', 'EXAMINATION', exam._id.toString(), `Created exam ${exam.name}`);
    return sendSuccess(res, exam, 'Examination scheduled', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const getAllocations = async (req, res) => {
  try {
    const allocations = await ExamRoomAllocation.find({ examination: req.params.examId })
      .populate('classroom')
      .populate({ path: 'invigilator', populate: { path: 'user' } });
    return sendSuccess(res, allocations);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const allocateRoom = async (req, res) => {
  try {
    const { examination, classroom, allocatedStudentsCount, invigilator } = req.body;

    const room = await Classroom.findById(classroom);
    if (!room) return sendError(res, 'Classroom not found', 404);

    if (allocatedStudentsCount > room.capacity) {
      return sendError(res, `Allocated count (${allocatedStudentsCount}) exceeds room capacity (${room.capacity})`, 400);
    }

    const allocation = await ExamRoomAllocation.create({
      examination,
      classroom,
      allocatedStudentsCount,
      invigilator: invigilator || null,
    });

    await logAudit(req, 'EXAM_ROOM_ALLOCATE', 'EXAM_ALLOCATION', allocation._id.toString(), `Allocated room ${room.roomNumber} for exam.`);

    return sendSuccess(res, allocation, 'Exam room allocated successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  getExams,
  createExam,
  getAllocations,
  allocateRoom,
};
