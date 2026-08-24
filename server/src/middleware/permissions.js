const { hasPermission } = require('../config/permissions');
const { sendError } = require('../utils/response');
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');

/**
 * Centralized Permission Middleware
 * Verifies authentication, permission code, and data scope.
 */

// 1. Require Explicit Permission Code
const requirePermission = (permissionCode) => {
  return async (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated access attempt', 401);
    }

    if (!hasPermission(req.user.role, permissionCode)) {
      // Log Security Alert & Audit Log for Unauthorized Access Attempt
      try {
        await SecurityAlert.create({
          alertType: 'UNAUTHORIZED_ACCESS',
          user: req.user._id,
          userEmail: req.user.email,
          severity: 'HIGH',
          description: `User '${req.user.name}' (Role: ${req.user.role}) denied access to '${req.method} ${req.originalUrl}' (Requires permission: '${permissionCode}')`,
          ipAddress: req.ip || req.connection.remoteAddress || '127.0.0.1',
        });

        await AuditLog.create({
          user: req.user._id,
          userName: req.user.name,
          userRole: req.user.role,
          action: 'PERMISSION_DENIED',
          entity: 'SECURITY',
          details: `Access denied to ${req.method} ${req.originalUrl} - Missing '${permissionCode}'`,
          ipAddress: req.ip || '127.0.0.1',
        });
      } catch (err) {
        console.error('Security alert logging error:', err.message);
      }

      return sendError(res, `Forbidden: Role '${req.user.role}' lacks permission '${permissionCode}'`, 403);
    }

    next();
  };
};

// 2. Require Department Scope (Enforces HOD cannot modify another department's data)
const requireDepartmentScope = (deptIdExtractor = (req) => req.query.department || req.body.department || req.params.departmentId) => {
  return async (req, res, next) => {
    if (!req.user) return sendError(res, 'Not authenticated', 401);

    // ADMIN has global institutional scope
    if (req.user.role === 'ADMIN') return next();

    // HOD is restricted strictly to their own department
    if (req.user.role === 'HOD') {
      const requestedDeptId = deptIdExtractor(req);
      const userDeptId = req.user.department?._id?.toString() || req.user.department?.toString();

      if (requestedDeptId && userDeptId && requestedDeptId.toString() !== userDeptId) {
        try {
          await AuditLog.create({
            user: req.user._id,
            userName: req.user.name,
            userRole: req.user.role,
            action: 'DEPARTMENT_SCOPE_DENIED',
            entity: 'SECURITY',
            details: `HOD attempted to access foreign department '${requestedDeptId}' (Own department: '${userDeptId}')`,
            ipAddress: req.ip || '127.0.0.1',
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }

        return sendError(res, `Forbidden: Access restricted strictly to your assigned department`, 403);
      }
    }

    next();
  };
};

// 3. Require Self/Ownership Scope (Enforces Faculty/Student only access own data)
const requireOwnership = (idExtractor = (req) => req.params.userId || req.params.id) => {
  return async (req, res, next) => {
    if (!req.user) return sendError(res, 'Not authenticated', 401);

    if (req.user.role === 'ADMIN') return next();

    const targetId = idExtractor(req);
    const currentUserId = req.user._id.toString();

    if (targetId && targetId.toString() !== currentUserId) {
      return sendError(res, 'Forbidden: You can only access or modify your own profile/data', 403);
    }

    next();
  };
};

module.exports = {
  requirePermission,
  requireDepartmentScope,
  requireOwnership,
};
