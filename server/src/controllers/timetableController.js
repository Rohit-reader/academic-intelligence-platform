const Timetable = require('../models/Timetable');
const TimetableEntry = require('../models/TimetableEntry');
const AuditLog = require('../models/AuditLog');
const { generateTimetableForDepartment } = require('../services/timetableEngine');
const { detectConflicts } = require('../services/conflictDetector');
const { sendSuccess, sendError } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

// Get Timetable & Entries (With Department-Scope Enforcement)
const getTimetable = async (req, res) => {
  try {
    let { department, semester, facultyId, sectionId } = req.query;

    // Enforce Scope: FACULTY and HOD CANNOT view another department's timetable
    if (req.user.role === 'FACULTY' || req.user.role === 'HOD') {
      const userDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
      if (userDeptId) {
        if (department && department.toString() !== userDeptId) {
          // Log security audit for attempted cross-department access
          await AuditLog.create({
            user: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'DEPARTMENT_SCOPE_DENIED',
            entity: 'SECURITY',
            details: `User attempted to view foreign department timetable '${department}' (User department: '${userDeptId}')`,
            ipAddress: req.ip || '127.0.0.1',
          });
          return sendError(res, 'Forbidden: A department faculty or HOD cannot view another department\'s timetable', 403);
        }
        department = userDeptId;
      }
    }

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
    let { department, semester, academicYear } = req.body;

    // Enforce Scope: HOD cannot generate timetable for another department
    if (req.user.role === 'HOD') {
      const userDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
      if (userDeptId && department && department.toString() !== userDeptId) {
        return sendError(res, 'Forbidden: You can only generate timetable for your own department', 403);
      }
      if (userDeptId) department = userDeptId;
    }

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
