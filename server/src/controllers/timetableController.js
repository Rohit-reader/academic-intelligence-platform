const Timetable = require('../models/Timetable');
const TimetableEntry = require('../models/TimetableEntry');
const { generateTimetableForDepartment } = require('../services/timetableEngine');
const { detectConflicts } = require('../services/conflictDetector');
const { sendSuccess, sendError } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

// Get Timetable & Entries
const getTimetable = async (req, res) => {
  try {
    const { department, semester, facultyId, sectionId } = req.query;

    let query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);

    const activeTimetable = await Timetable.findOne({ ...query, status: 'ACTIVE' }).populate('department');

    if (!activeTimetable) {
      return sendSuccess(res, { timetable: null, entries: [], conflicts: [] });
    }

    let entryQuery = { timetable: activeTimetable._id };
    if (facultyId) entryQuery.faculty = facultyId;
    if (sectionId) entryQuery.section = sectionId;

    const entries = await TimetableEntry.find(entryQuery)
      .populate('subject')
      .populate('section')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name email' } })
      .populate('classroom')
      .populate('laboratory');

    const conflicts = await detectConflicts(activeTimetable._id);

    return sendSuccess(res, {
      timetable: activeTimetable,
      entries,
      conflicts,
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Generate Timetable (Rule-Based Engine)
const generateTimetable = async (req, res) => {
  try {
    const { department, semester, academicYear } = req.body;

    if (!department || !semester) {
      return sendError(res, 'Department and semester are required', 400);
    }

    const result = await generateTimetableForDepartment({
      departmentId: department,
      semester: Number(semester),
      academicYear: academicYear || '2025-2026',
      createdBy: req.user._id,
    });

    await logAudit(req, 'TIMETABLE_GENERATE', 'TIMETABLE', result.timetable._id.toString(), `Generated timetable with ${result.entriesCount} entries.`);

    return sendSuccess(res, result, 'Timetable generated successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Manual Entry Add/Edit
const createEntry = async (req, res) => {
  try {
    const entry = await TimetableEntry.create(req.body);
    await logAudit(req, 'TIMETABLE_ENTRY_CREATE', 'TIMETABLE_ENTRY', entry._id.toString(), 'Added timetable entry manually');
    return sendSuccess(res, entry, 'Entry added', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const deleteEntry = async (req, res) => {
  try {
    await TimetableEntry.findByIdAndDelete(req.params.id);
    await logAudit(req, 'TIMETABLE_ENTRY_DELETE', 'TIMETABLE_ENTRY', req.params.id, 'Deleted timetable entry');
    return sendSuccess(res, null, 'Entry deleted');
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Check Conflicts API
const checkConflictsAPI = async (req, res) => {
  try {
    const { timetableId } = req.query;
    const conflicts = await detectConflicts(timetableId);
    return sendSuccess(res, conflicts);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  getTimetable,
  generateTimetable,
  createEntry,
  deleteEntry,
  checkConflictsAPI,
};
