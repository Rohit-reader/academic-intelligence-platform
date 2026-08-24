const express = require('express');
const router = express.Router();
const { getExams, createExam, getAllocations, allocateRoom } = require('../controllers/examController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getExams);
router.post('/', authorize('ADMIN', 'EXAM_CELL'), createExam);
router.get('/:examId/allocations', getAllocations);
router.post('/allocate', authorize('ADMIN', 'EXAM_CELL'), allocateRoom);

module.exports = router;
