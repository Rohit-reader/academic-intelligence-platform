const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, reviewLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.post('/apply', authorize('FACULTY', 'HOD'), applyLeave);
router.get('/', getLeaves);
router.put('/:id/review', authorize('ADMIN', 'HOD'), reviewLeave);

module.exports = router;
