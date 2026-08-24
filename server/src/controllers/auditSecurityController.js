const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const { checkAnomalies } = require('../services/anomalyDetector');
const { sendSuccess, sendError } = require('../utils/response');

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return sendSuccess(res, logs);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const getSecurityAlerts = async (req, res) => {
  try {
    // Run rule-based anomaly detector scan
    await checkAnomalies();

    const alerts = await SecurityAlert.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    return sendSuccess(res, alerts);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const resolveSecurityAlert = async (req, res) => {
  try {
    const alert = await SecurityAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'RESOLVED' },
      { new: true }
    );
    return sendSuccess(res, alert, 'Security alert resolved.');
  } catch (error) {
    return sendError(res, error.message);
  }
};

module.exports = {
  getAuditLogs,
  getSecurityAlerts,
  resolveSecurityAlert,
};
