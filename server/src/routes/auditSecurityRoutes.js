const express = require('express');
const router = express.Router();
const { getAuditLogs, getSecurityAlerts, resolveSecurityAlert } = require('../controllers/auditSecurityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/audit', getAuditLogs);
router.get('/security/alerts', getSecurityAlerts);
router.put('/security/alerts/:id/resolve', resolveSecurityAlert);

module.exports = router;
