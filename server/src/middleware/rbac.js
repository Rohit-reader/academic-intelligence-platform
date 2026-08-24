const { sendError } = require('../utils/response');
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');

const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      // Create Security Alert for unauthorized access attempt
      try {
        await SecurityAlert.create({
          alertType: 'UNAUTHORIZED_ACCESS',
          user: req.user._id,
          userEmail: req.user.email,
          severity: 'HIGH',
          description: `User with role '${req.user.role}' attempted to access restricted endpoint '${req.originalUrl}' (Requires: ${roles.join(', ')})`,
          ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
        });

        await AuditLog.create({
          user: req.user._id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'PERMISSION_DENIED',
          entity: 'SECURITY',
          details: `Access denied to ${req.method} ${req.originalUrl}`,
          ipAddress: req.ip || '127.0.0.1',
        });
      } catch (err) {
        console.error('Failed to log security alert:', err.message);
      }

      return sendError(res, `Forbidden: Role '${req.user.role}' is not authorized to perform this action`, 403);
    }

    next();
  };
};

module.exports = { authorize };
