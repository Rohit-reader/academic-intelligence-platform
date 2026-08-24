const express = require('express');
const router = express.Router();
const {
  getTimetable,
  generateTimetable,
  createEntry,
  deleteEntry,
  checkConflictsAPI,
} = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getTimetable);
router.post('/generate', authorize('ADMIN', 'HOD'), generateTimetable);
router.post('/entries', authorize('ADMIN', 'HOD'), createEntry);
router.delete('/entries/:id', authorize('ADMIN', 'HOD'), deleteEntry);
router.get('/conflicts', checkConflictsAPI);

module.exports = router;
