const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   POST api/chat
// @desc    Send message to AI
// @access  Private
router.post('/', authMiddleware, chatController.handleChat);

module.exports = router;
