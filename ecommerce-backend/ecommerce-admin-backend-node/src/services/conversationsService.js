const { pool } = require('../config/database');

/**
 * Get all conversations for admin inbox
 */
const listConversations = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.conversation_id,
        c.user_id,
        c.customer_name,
        c.customer_email,
        c.status,
        c.last_message_at,
        c.created_at,
        c.updated_at,
        u.user_name,
        u.user_email,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.conversation_id AND m.from_type = 'customer' AND m.created_at > COALESCE((SELECT MAX(created_at) FROM messages WHERE conversation_id = c.conversation_id AND from_type = 'admin'), '1970-01-01')) as unread_count
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.status = 'active'
      ORDER BY c.last_message_at DESC, c.created_at DESC
    `);

    return rows.map(row => ({
      id: row.conversation_id,
      conversation_id: row.conversation_id,
      user_id: row.user_id,
      participant: {
        id: row.user_id ? `customer-${row.user_id}` : `guest-${row.conversation_id}`,
        name: row.customer_name || row.user_name || 'Customer',
        email: row.customer_email || row.user_email,
        online: false // Will be updated via socket
      },
      meta: formatLastSeen(row.last_message_at),
      unread: row.unread_count || 0,
      last_message_at: row.last_message_at,
      created_at: row.created_at
    }));
  } catch (error) {
    console.error('Error listing conversations:', error);
    throw new Error('ERR_LIST_CONVERSATIONS_FAILED');
  }
};

/**
 * Get messages for a conversation
 */
const getMessages = async (conversationId) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id,
        m.message_id,
        m.conversation_id,
        m.from_type,
        m.from_id,
        m.from_name,
        m.message,
        m.created_at
      FROM messages m
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [conversationId]);

    return rows.map(row => ({
      id: row.message_id || `msg_${row.id}`,
      author: row.from_type === 'admin' ? 'agent' : 'customer',
      text: row.message,
      time: formatTime(row.created_at),
      timestamp: row.created_at,
      from: row.from_type,
      from_name: row.from_name
    }));
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('ERR_GET_MESSAGES_FAILED');
  }
};

/**
 * Get a single conversation by ID
 */
const getConversation = async (conversationId) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.conversation_id,
        c.user_id,
        c.customer_name,
        c.customer_email,
        c.status,
        c.last_message_at,
        c.created_at,
        c.updated_at,
        u.user_name,
        u.user_email
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.conversation_id = ?
    `, [conversationId]);

    if (rows.length === 0) {
      throw new Error('ERR_CONVERSATION_NOT_FOUND');
    }

    const row = rows[0];
    return {
      id: row.conversation_id,
      conversation_id: row.conversation_id,
      user_id: row.user_id,
      participant: {
        id: row.user_id ? `customer-${row.user_id}` : `guest-${row.conversation_id}`,
        name: row.customer_name || row.user_name || 'Customer',
        email: row.customer_email || row.user_email,
        online: false
      },
      meta: formatLastSeen(row.last_message_at),
      last_message_at: row.last_message_at,
      created_at: row.created_at
    };
  } catch (error) {
    if (error.message === 'ERR_CONVERSATION_NOT_FOUND') {
      throw error;
    }
    console.error('Error getting conversation:', error);
    throw new Error('ERR_GET_CONVERSATION_FAILED');
  }
};

/**
 * Create or update conversation
 * userId can be null for guest users
 */
const upsertConversation = async (conversationId, userId = null, customerName = null, customerEmail = null) => {
  try {
    // Check if conversation exists
    const [existing] = await pool.query(`
      SELECT conversation_id, user_id FROM conversations WHERE conversation_id = ?
    `, [conversationId]);

    if (existing.length > 0) {
      // Update existing conversation
      const updateFields = ['last_message_at = NOW()', 'updated_at = NOW()'];
      const updateValues = [];
      
      if (userId !== null && existing[0].user_id === null) {
        updateFields.push('user_id = ?');
        updateValues.push(userId);
      }
      if (customerName !== null) {
        updateFields.push('customer_name = ?');
        updateValues.push(customerName);
      }
      if (customerEmail !== null) {
        updateFields.push('customer_email = ?');
        updateValues.push(customerEmail);
      }
      
      updateValues.push(conversationId);
      
      await pool.query(`
        UPDATE conversations 
        SET ${updateFields.join(', ')}
        WHERE conversation_id = ?
      `, updateValues);
    } else {
      // Create new conversation
      // user_id can be NULL for guest users
      await pool.query(`
        INSERT INTO conversations (conversation_id, user_id, customer_name, customer_email, last_message_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [conversationId, userId, customerName, customerEmail]);
    }

    return conversationId;
  } catch (error) {
    console.error('Error upserting conversation:', error);
    throw new Error('ERR_UPSERT_CONVERSATION_FAILED');
  }
};

/**
 * Save a message to database
 */
const saveMessage = async (messageData) => {
  try {
    const {
      messageId,
      conversationId,
      fromType,
      fromId,
      fromName,
      message
    } = messageData;

    await pool.query(`
      INSERT INTO messages (message_id, conversation_id, from_type, from_id, from_name, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [messageId, conversationId, fromType, fromId, fromName, message]);

    // Update conversation last_message_at
    await pool.query(`
      UPDATE conversations 
      SET last_message_at = NOW(), updated_at = NOW()
      WHERE conversation_id = ?
    `, [conversationId]);

    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error('ERR_SAVE_MESSAGE_FAILED');
  }
};

/**
 * Helper: Format time for display
 */
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
};

/**
 * Helper: Format last seen metadata
 */
const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'No messages yet';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Online now';
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    if (diffDays === 1) return 'Replied yesterday';
    if (diffDays < 7) return `Last seen ${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown';
  }
};

module.exports = {
  listConversations,
  getConversation,
  getMessages,
  upsertConversation,
  saveMessage
};

