const User = require('../models/User');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Department = require('../models/Department');
const Classroom = require('../models/Classroom');
const Laboratory = require('../models/Laboratory');
const Timetable = require('../models/Timetable');
const TimetableEntry = require('../models/TimetableEntry');
const LeaveRequest = require('../models/LeaveRequest');
const SecurityAlert = require('../models/SecurityAlert');
const AuditLog = require('../models/AuditLog');
const Examination = require('../models/Examination');
const Event = require('../models/Event');
const Recommendation = require('../models/Recommendation');
const { detectConflicts } = require('../services/conflictDetector');
const { sendSuccess, sendError } = require('../utils/response');

const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    let data = {};

    if (role === 'ADMIN') {
      const studentCount = await Student.countDocuments();
      const facultyCount = await Faculty.countDocuments();
      const departmentCount = await Department.countDocuments();
      const classroomCount = await Classroom.countDocuments();
      const labCount = await Laboratory.countDocuments();
      const activeTimetable = await Timetable.findOne({ status: 'ACTIVE' });
      const pendingLeaves = await LeaveRequest.countDocuments({ status: 'PENDING' });
      const openAlerts = await SecurityAlert.countDocuments({ status: 'OPEN' });
      const recentAudits = await AuditLog.find().sort({ createdAt: -1 }).limit(5);

      const conflicts = activeTimetable ? await detectConflicts(activeTimetable._id) : [];

      data = {
        totalStudents: studentCount,
        facultyCount,
        departmentsCount: departmentCount,
        classroomsCount: classroomCount,
        labsCount: labCount,
        activeTimetable: activeTimetable ? activeTimetable.name : 'None',
        pendingApprovals: pendingLeaves,
        conflictsCount: conflicts.length,
        conflicts,
        securityAlertsCount: openAlerts,
        recentAuditLogs: recentAudits,
      };
    } else if (role === 'HOD') {
      const deptId = req.user.department?._id;
      const deptFaculty = await Faculty.find({ department: deptId }).populate('user');
      const activeTimetable = await Timetable.findOne({ department: deptId, status: 'ACTIVE' });

      const pendingLeaves = await LeaveRequest.countDocuments({
        faculty: { $in: deptFaculty.map((f) => f._id) },
        status: 'PENDING',
      });

      const conflicts = activeTimetable ? await detectConflicts(activeTimetable._id) : [];

      const recommendationsCount = await Recommendation.countDocuments({ status: 'PROPOSED' });

      data = {
        departmentName: req.user.department?.name || 'Department',
        facultyCount: deptFaculty.length,
        facultyWorkloads: deptFaculty.map((f) => ({
          name: f.user?.name || f.employeeId,
          current: f.currentWorkload,
          max: f.maxWeeklyWorkload,
        })),
        pendingLeaves,
        conflictsCount: conflicts.length,
        recommendationsCount,
      };
    } else if (role === 'FACULTY') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      const leaves = faculty ? await LeaveRequest.find({ faculty: faculty._id }).sort({ createdAt: -1 }) : [];

      const entries = faculty ? await TimetableEntry.find({ faculty: faculty._id })
        .populate('subject section classroom laboratory') : [];

      data = {
        employeeId: faculty?.employeeId || '',
        designation: faculty?.designation || '',
        currentWorkload: faculty?.currentWorkload || 0,
        maxWeeklyWorkload: faculty?.maxWeeklyWorkload || 18,
        timetableEntries: entries,
        leaveHistory: leaves,
      };
    } else if (role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user._id }).populate('section');
      const entries = student && student.section ? await TimetableEntry.find({ section: student.section._id })
        .populate('subject faculty classroom laboratory') : [];

      const exams = await Examination.find().populate('subject').sort({ date: 1 }).limit(5);
      const events = await Event.find().sort({ date: 1 }).limit(5);

      data = {
        rollNumber: student?.rollNumber || '',
        semester: student?.semester || 1,
        sectionName: student?.section?.name || 'Unassigned',
        timetableEntries: entries,
        upcomingExams: exams,
        upcomingEvents: events,
      };
    } else if (role === 'EXAM_CELL') {
      const exams = await Examination.find().populate('subject department').sort({ date: 1 });
      const classrooms = await Classroom.find();
      const totalCapacity = classrooms.reduce((sum, r) => sum + r.capacity, 0);

      data = {
        upcomingExams: exams,
        examCount: exams.length,
        classroomsCount: classrooms.length,
        totalSeatingCapacity: totalCapacity,
      };
    }

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = { getDashboardStats };
