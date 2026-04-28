const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin', 'officer'));

router.get('/overview', ctrl.getOverview);
router.get('/by-category', ctrl.getByCategory);
router.get('/trends', ctrl.getTrends);
router.get('/geographic', ctrl.getGeographic);
router.get('/status-distribution', ctrl.getStatusDistribution);
router.get('/financial', ctrl.getFinancialAnalysis);

module.exports = router;
