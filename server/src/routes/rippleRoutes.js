const express = require('express');
const router = express.Router();
const { handleAnalyzeRipple, handleApplyRipple } = require('../controllers/rippleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.post('/analyze', authorize('ADMIN', 'HOD', 'FACULTY', 'EXAM_CELL'), handleAnalyzeRipple);
router.post('/apply', authorize('ADMIN', 'HOD'), handleApplyRipple);

module.exports = router;
