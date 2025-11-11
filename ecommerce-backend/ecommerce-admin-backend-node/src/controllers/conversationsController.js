const conversationsService = require('../services/conversationsService');

/**
 * GET /api/conversations
 * List all conversations
 */
const listConversations = async (req, res) => {
  try {
    const conversations = await conversationsService.listConversations();
    return res.json({
      success: true,
      data: conversations
    });
  } catch (err) {
    console.error('List conversations error:', err);
    if (err.message === 'ERR_LIST_CONVERSATIONS_FAILED') {
      return res.status(500).json({
        error: 'ERR_LIST_CONVERSATIONS_FAILED',
        message: 'Failed to list conversations'
      });
    }
    return res.status(500).json({
      error: 'ERR_LIST_CONVERSATIONS_FAILED',
      message: 'Failed to list conversations'
    });
  }
};

/**
 * GET /api/conversations/:conversationId
 * Get a single conversation
 */
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await conversationsService.getConversation(conversationId);
    return res.json({
      success: true,
      data: conversation
    });
  } catch (err) {
    console.error('Get conversation error:', err);
    if (err.message === 'ERR_CONVERSATION_NOT_FOUND') {
      return res.status(404).json({
        error: 'ERR_CONVERSATION_NOT_FOUND',
        message: 'Conversation not found'
      });
    }
    return res.status(500).json({
      error: 'ERR_GET_CONVERSATION_FAILED',
      message: 'Failed to get conversation'
    });
  }
};

/**
 * GET /api/conversations/:conversationId/messages
 * Get messages for a conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await conversationsService.getMessages(conversationId);
    return res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    console.error('Get messages error:', err);
    if (err.message === 'ERR_GET_MESSAGES_FAILED') {
      return res.status(500).json({
        error: 'ERR_GET_MESSAGES_FAILED',
        message: 'Failed to get messages'
      });
    }
    return res.status(500).json({
      error: 'ERR_GET_MESSAGES_FAILED',
      message: 'Failed to get messages'
    });
  }
};

module.exports = {
  listConversations,
  getConversation,
  getMessages
};


