const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');

const checkAnomalies = async () => {
  const alertsCreated = [];

  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

  // 1. Check for excessive timetable modifications by a single user
  const timetableEdits = await AuditLog.aggregate([
    { $match: { action: { $in: ['TIMETABLE_GENERATE', 'TIMETABLE_ENTRY_UPDATE', 'TIMETABLE_ENTRY_DELETE'] }, createdAt: { $gte: fifteenMinsAgo } } },
    { $group: { _id: '$user', count: { $sum: 1 }, userName: { $first: '$userName' } } },
    { $match: { count: { $gt: 10 } } },
  ]);

  for (const item of timetableEdits) {
    if (item._id) {
      const existing = await SecurityAlert.findOne({
        user: item._id,
        alertType: 'EXCESSIVE_TIMETABLE_CHANGES',
        status: 'OPEN',
      });
      if (!existing) {
        const alert = await SecurityAlert.create({
          alertType: 'EXCESSIVE_TIMETABLE_CHANGES',
          user: item._id,
          severity: 'HIGH',
          description: `User '${item.userName}' performed ${item.count} timetable modifications within the last 15 minutes.`,
        });
        alertsCreated.push(alert);
      }
    }
  }

  // 2. Check for multiple failed login attempts
  const failedLogins = await AuditLog.aggregate([
    { $match: { action: 'LOGIN_FAILED', createdAt: { $gte: fifteenMinsAgo } } },
    { $group: { _id: '$details', count: { $sum: 1 }, ipAddress: { $first: '$ipAddress' } } },
    { $match: { count: { $gte: 5 } } },
  ]);

  for (const item of failedLogins) {
    const existing = await SecurityAlert.findOne({
      description: { $regex: item.ipAddress || '' },
      alertType: 'MULTIPLE_FAILED_LOGINS',
      status: 'OPEN',
    });
    if (!existing) {
      const alert = await SecurityAlert.create({
        alertType: 'MULTIPLE_FAILED_LOGINS',
        severity: 'CRITICAL',
        description: `Detected ${item.count} failed login attempts from IP: ${item.ipAddress || 'unknown'} (${item._id}).`,
      });
      alertsCreated.push(alert);
    }
  }

  return alertsCreated;
};

module.exports = { checkAnomalies };
