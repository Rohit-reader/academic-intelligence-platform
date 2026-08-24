const express = require('express');
const router = express.Router();
const { getAuditLogs, getSecurityAlerts, resolveSecurityAlert, getPermissionsMatrix } = require('../controllers/auditSecurityController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');

router.use(protect);

router.get('/audit', requirePermission('audit:read'), getAuditLogs);
router.get('/security/alerts', requirePermission('security:read'), getSecurityAlerts);
router.put('/security/alerts/:id/resolve', requirePermission('security:manage'), resolveSecurityAlert);
router.get('/permissions', requirePermission('security:read'), getPermissionsMatrix);

module.exports = router;
