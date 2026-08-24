const express = require('express');
const router = express.Router();
const { createSimulation, getSimulations, applyScenario } = require('../controllers/simulationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.post('/', authorize('ADMIN', 'HOD'), createSimulation);
router.get('/', authorize('ADMIN', 'HOD'), getSimulations);
router.post('/:id/apply', authorize('ADMIN', 'HOD'), applyScenario);

module.exports = router;
