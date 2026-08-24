const express = require('express');
const router = express.Router();
const { getEvents, createEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', getEvents);
router.post('/', authorize('ADMIN', 'HOD'), createEvent);

module.exports = router;
