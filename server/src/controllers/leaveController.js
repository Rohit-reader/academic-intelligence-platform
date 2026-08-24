const LeaveRequest = require('../models/LeaveRequest');
const Faculty = require('../models/Faculty');
const TimetableEntry = require('../models/TimetableEntry');
const { generateLeaveSubstitutionRecommendation } = require('../services/recommendationService');
const { sendSuccess, sendError } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

// Apply for leave (Faculty)
const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    const faculty = await Faculty.findOne({ user: req.user._id });
    if (!faculty) {
      return sendError(res, 'Faculty profile not found for this user', 404);
    }

    // Generate AI recommendation for substitution
    const { recommendation, affectedEntriesCount } = await generateLeaveSubstitutionRecommendation(
      faculty._id,
      startDate,
      endDate
    );

    const leave = await LeaveRequest.create({
      faculty: faculty._id,
      startDate,
      endDate,
      reason,
      status: 'PENDING',
      aiRecommendation: recommendation._id,
    });

    await logAudit(req, 'LEAVE_APPLY', 'LEAVE', leave._id.toString(), `Faculty submitted leave request from ${startDate} to ${endDate}. ${affectedEntriesCount} classes affected.`);

    return sendSuccess(res, { leave, recommendation }, 'Leave request submitted with AI substitution options.', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Get Leave Requests (HOD / Admin / Faculty)
const getLeaves = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'FACULTY') {
      const faculty = await Faculty.findOne({ user: req.user._id });
      if (faculty) query.faculty = faculty._id;
    } else if (req.user.role === 'HOD' && req.user.department) {
      const deptFaculties = await Faculty.find({ department: req.user.department._id });
      query.faculty = { $in: deptFaculties.map((f) => f._id) };
    }

    const leaves = await LeaveRequest.find(query)
      .populate({ path: 'faculty', populate: { path: 'user department', select: 'name email code' } })
      .populate('substituteFaculty')
      .populate('aiRecommendation')
      .sort({ createdAt: -1 });

    return sendSuccess(res, leaves);
  } catch (error) {
    return sendError(res, error.message);
  }
};

// Approve / Reject Leave Request (HOD / Admin)
const reviewLeave = async (req, res) => {
  try {
    const { status, substituteFacultyId, reviewComments } = req.body;

    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return sendError(res, 'Leave request not found', 404);

    leave.status = status;
    leave.reviewComments = reviewComments || '';
    leave.reviewedBy = req.user._id;

    if (substituteFacultyId) {
      leave.substituteFaculty = substituteFacultyId;
      // Reassign affected entries if approved
      if (status === 'APPROVED') {
        await TimetableEntry.updateMany(
          { faculty: leave.faculty },
          { $set: { faculty: substituteFacultyId } }
        );
      }
    }

    await leave.save();

    await logAudit(req, 'LEAVE_REVIEW', 'LEAVE', leave._id.toString(), `Leave request status set to ${status}.`);

    return sendSuccess(res, leave, `Leave request ${status.toLowerCase()} successfully.`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  reviewLeave,
};
