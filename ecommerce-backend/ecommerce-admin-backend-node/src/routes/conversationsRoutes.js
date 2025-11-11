const express = require('express');
const router = express.Router();
const conversationsController = require('../controllers/conversationsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /api/conversations - List all conversations
router.get('/', conversationsController.listConversations);

// GET /api/conversations/:conversationId - Get a single conversation
router.get('/:conversationId', conversationsController.getConversation);

// GET /api/conversations/:conversationId/messages - Get messages for a conversation
router.get('/:conversationId/messages', conversationsController.getMessages);

module.exports = router;

