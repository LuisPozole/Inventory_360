const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   GET api/dashboard/stats
// @desc    Get dashboard KPIs
// @access  Private
router.get('/stats', authMiddleware, dashboardController.getDashboardStats);

module.exports = router;
