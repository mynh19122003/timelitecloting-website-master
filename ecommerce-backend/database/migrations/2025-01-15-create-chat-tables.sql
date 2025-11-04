-- Migration: Create chat_messages table for real-time chat
-- Date: 2025-01-15
-- Description: Tạo bảng để lưu trữ tin nhắn chat real-time

USE ecommerce_db;

-- Tạo bảng chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'ID của user (có thể NULL nếu là guest)',
  user_email VARCHAR(255) NULL COMMENT 'Email của user hoặc guest',
  user_name VARCHAR(255) NULL COMMENT 'Tên của user hoặc guest',
  message TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
  sender_type ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT 'Loại người gửi',
  is_read TINYINT(1) DEFAULT 0 COMMENT 'Đã đọc chưa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
  
  -- Foreign key constraint (optional, có thể NULL cho guest)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  -- Indexes để tối ưu query
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  INDEX idx_sender_type (sender_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ tin nhắn chat';

-- Tạo bảng chat_sessions để quản lý phiên chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE COMMENT 'Socket.IO session ID',
  user_id INT NULL COMMENT 'ID của user (có thể NULL nếu là guest)',
  user_email VARCHAR(255) NULL COMMENT 'Email của user hoặc guest',
  user_name VARCHAR(255) NULL COMMENT 'Tên của user hoặc guest',
  is_active TINYINT(1) DEFAULT 1 COMMENT 'Phiên chat có đang active không',
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Lần hoạt động cuối',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_session_id (session_id),
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active),
  INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý phiên chat Socket.IO';

SELECT 'Chat tables created successfully!' as message;
DESCRIBE chat_messages;
DESCRIBE chat_sessions;




