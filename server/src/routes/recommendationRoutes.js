const express = require('express');
const router = express.Router();
const { getRecommendations, optimizeResource } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/', authorize('ADMIN', 'HOD'), getRecommendations);
router.post('/optimize-resource', authorize('ADMIN', 'HOD'), optimizeResource);

module.exports = router;
