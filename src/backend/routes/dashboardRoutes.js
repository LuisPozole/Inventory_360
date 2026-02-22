const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   GET api/dashboard/stats
// @desc    Get dashboard KPIs (enhanced)
// @access  Private
router.get('/stats', authMiddleware, dashboardController.getDashboardStats);

// @route   GET api/dashboard/alerts
// @desc    Get products with critical/low stock
// @access  Private
router.get('/alerts', authMiddleware, dashboardController.getAlerts);

// @route   GET api/dashboard/demand-prediction
// @desc    Get monthly demand data + AI prediction trend
// @access  Private
router.get('/demand-prediction', authMiddleware, dashboardController.getDemandPrediction);

// @route   GET api/dashboard/category-demand
// @desc    Get sales aggregated by category (last 30 days)
// @access  Private
router.get('/category-demand', authMiddleware, dashboardController.getCategoryDemand);

// @route   GET api/dashboard/recommendations
// @desc    Get AI recommendations per category
// @access  Private
router.get('/recommendations', authMiddleware, dashboardController.getRecommendations);

module.exports = router;
