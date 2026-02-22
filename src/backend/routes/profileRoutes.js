const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/profile
// @desc    Get current user profile
router.get('/', profileController.getProfile);

// @route   PUT /api/profile
// @desc    Update profile fields (name, email, phone)
router.put('/', profileController.updateProfile);

// @route   POST /api/profile/image
// @desc    Upload profile image
router.post('/image', profileController.uploadImage, profileController.saveImage);

module.exports = router;
