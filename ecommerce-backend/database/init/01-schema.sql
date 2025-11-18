-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admin;

-- Users table (mandatory minimal structure)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(16) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NULL,
    user_phone VARCHAR(32) NULL,
    user_address VARCHAR(500) NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Email verification fields
    email_verified TINYINT(1) DEFAULT 0,
    verification_token VARCHAR(255) NULL,
    -- Password reset fields
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_user_code (user_code),
    INDEX idx_reset_token (reset_token),
    INDEX idx_verification_token (verification_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admins table for admin backend
CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(32) UNIQUE,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    admin_password VARCHAR(255) NOT NULL, -- may be bcrypt hash or legacy plaintext (auto-upgraded on login)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_email (admin_email),
    INDEX idx_admin_id (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table (expanded to match frontend sample JSON)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL, -- maps to frontend product id (e.g., 'ao-dai-regal-crimson')
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NULL,
    variant VARCHAR(128) NULL, -- variant of product (e.g., 'Áo Dài Cách Tân', 'Áo Dài Truyền Thống')
    short_description TEXT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NULL,
    stock INT NOT NULL DEFAULT 0,
    colors JSON NULL,
    sizes JSON NULL,
    image_url VARCHAR(500) NULL,
    gallery JSON NULL,
    rating DECIMAL(3,1) NULL,
    reviews INT NULL,
    tags JSON NULL,
    is_featured TINYINT(1) DEFAULT 0,
    is_new TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_variant (variant),
    INDEX idx_price (price),
    INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table (merged, single table)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orders_id VARCHAR(32) UNIQUE,
    user_id INT NOT NULL,
    products_name TEXT NOT NULL,
    products_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- order_items removed after merging into orders

-- Chat tables for real-time messaging
CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL COMMENT 'ID của user (có thể NULL nếu là guest)',
  user_email VARCHAR(255) NULL COMMENT 'Email của user hoặc guest',
  user_name VARCHAR(255) NULL COMMENT 'Tên của user hoặc guest',
  message TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
  sender_type ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT 'Loại người gửi',
  is_read TINYINT(1) DEFAULT 0 COMMENT 'Đã đọc chưa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  INDEX idx_sender_type (sender_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ tin nhắn chat';

CREATE TABLE chat_sessions (
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

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý phiên chat Socket.IO';

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý phiên chat Socket.IO';

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý phiên chat Socket.IO';
