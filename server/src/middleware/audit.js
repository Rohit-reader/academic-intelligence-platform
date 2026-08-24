const AuditLog = require('../models/AuditLog');

const logAudit = async (req, action, entity = 'GENERAL', entityId = '', details = '') => {
  try {
    const userId = req && req.user ? req.user._id : null;
    const userName = req && req.user ? req.user.name : 'System';
    const userRole = req && req.user ? req.user.role : 'SYSTEM';
    const ipAddress = (req && (req.ip || (req.connection && req.connection.remoteAddress))) || '127.0.0.1';

    await AuditLog.create({
      user: userId,
      userName,
      userRole,
      action,
      entity,
      entityId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Audit log creation failed:', error.message);
  }
};

module.exports = { logAudit };
