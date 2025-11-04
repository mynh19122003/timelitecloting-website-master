const { pool } = require('../config/database');

/**
 * Lưu tin nhắn vào database
 */
const saveMessage = async (messageData) => {
  const {
    userId = null,
    userEmail = null,
    userName = null,
    message,
    senderType = 'user'
  } = messageData;

  try {
    const [result] = await pool.execute(
      `INSERT INTO chat_messages 
       (user_id, user_email, user_name, message, sender_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, userEmail, userName, message, senderType]
    );

    return {
      id: result.insertId,
      userId,
      userEmail,
      userName,
      message,
      senderType,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

/**
 * Lấy lịch sử tin nhắn
 */
const getMessageHistory = async (userId = null, limit = 50) => {
  try {
    let query = `
      SELECT id, user_id, user_email, user_name, message, sender_type, created_at 
      FROM chat_messages 
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND (user_id = ? OR user_id IS NULL)';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const [rows] = await pool.execute(query, params);

    return rows.reverse(); // Đảo ngược để hiển thị từ cũ đến mới
  } catch (error) {
    console.error('Error getting message history:', error);
    throw error;
  }
};

/**
 * Tạo hoặc cập nhật chat session
 */
const createOrUpdateSession = async (sessionData) => {
  const {
    sessionId,
    userId = null,
    userEmail = null,
    userName = null
  } = sessionData;

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM chat_sessions WHERE session_id = ?',
      [sessionId]
    );

    if (existing.length > 0) {
      // Update existing session
      await pool.execute(
        `UPDATE chat_sessions 
         SET user_id = ?, user_email = ?, user_name = ?, is_active = 1, last_activity = NOW() 
         WHERE session_id = ?`,
        [userId, userEmail, userName, sessionId]
      );
      return { ...sessionData, id: existing[0].id };
    } else {
      // Create new session
      const [result] = await pool.execute(
        `INSERT INTO chat_sessions 
         (session_id, user_id, user_email, user_name) 
         VALUES (?, ?, ?, ?)`,
        [sessionId, userId, userEmail, userName]
      );
      return { ...sessionData, id: result.insertId };
    }
  } catch (error) {
    console.error('Error creating/updating session:', error);
    throw error;
  }
};

/**
 * Đánh dấu session không active khi disconnect
 */
const deactivateSession = async (sessionId) => {
  try {
    await pool.execute(
      'UPDATE chat_sessions SET is_active = 0 WHERE session_id = ?',
      [sessionId]
    );
  } catch (error) {
    console.error('Error deactivating session:', error);
  }
};

/**
 * Đánh dấu tin nhắn đã đọc
 */
const markMessagesAsRead = async (userId = null, userEmail = null) => {
  try {
    let query = 'UPDATE chat_messages SET is_read = 1 WHERE is_read = 0 AND sender_type = "user"';
    const params = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    } else if (userEmail) {
      query += ' AND user_email = ? AND user_id IS NULL';
      params.push(userEmail);
    }

    await pool.execute(query, params);
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

/**
 * Lấy tất cả messages từ tất cả users (dành cho admin)
 */
const getAllMessages = async (limit = 100) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, user_id, user_email, user_name, message, sender_type, created_at 
       FROM chat_messages 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit]
    );

    return rows.reverse(); // Đảo ngược để hiển thị từ cũ đến mới
  } catch (error) {
    console.error('Error getting all messages:', error);
    throw error;
  }
};

/**
 * Lấy tất cả active sessions (dành cho admin)
 */
const getActiveSessions = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, session_id, user_id, user_email, user_name, is_active, last_activity, created_at 
       FROM chat_sessions 
       WHERE is_active = 1 
       ORDER BY last_activity DESC`
    );

    return rows;
  } catch (error) {
    console.error('Error getting active sessions:', error);
    throw error;
  }
};

module.exports = {
  saveMessage,
  getMessageHistory,
  createOrUpdateSession,
  deactivateSession,
  markMessagesAsRead,
  getAllMessages,
  getActiveSessions
};

