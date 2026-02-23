const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

// @route   POST api/chat
// @desc    Send message to AI
// @access  Private
router.post('/', authMiddleware, chatController.handleChat);

// @route   GET api/chat/history
// @desc    Get chat history for authenticated user
// @access  Private
router.get('/history', authMiddleware, chatController.getChatHistory);

// @route   DELETE api/chat/history
// @desc    Delete all chat history for authenticated user
// @access  Private
router.delete('/history', authMiddleware, chatController.deleteChatHistory);

module.exports = router;
