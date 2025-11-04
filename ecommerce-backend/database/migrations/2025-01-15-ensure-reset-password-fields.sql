-- Migration: Ensure reset password fields exist in users table
-- Date: 2025-01-15
-- Description: Đảm bảo các cột reset_token và reset_token_expiry tồn tại trong bảng users
-- Safe to run multiple times (idempotent)

USE ecommerce_db;

-- Kiểm tra và thêm cột reset_token nếu chưa có
SET @has_reset_token := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'reset_token'
);

SET @sql_reset_token := IF(
  @has_reset_token = 0,
  'ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL AFTER updated_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql_reset_token;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra và thêm cột reset_token_expiry nếu chưa có
SET @has_reset_token_expiry := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'reset_token_expiry'
);

SET @sql_reset_token_expiry := IF(
  @has_reset_token_expiry = 0,
  'ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token',
  'SELECT 1'
);
PREPARE stmt FROM @sql_reset_token_expiry;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra và thêm index cho reset_token nếu chưa có
SET @has_index := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_reset_token'
);

SET @sql_index := IF(
  @has_index = 0,
  'CREATE INDEX idx_reset_token ON users(reset_token)',
  'SELECT 1'
);
PREPARE stmt FROM @sql_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Hiển thị kết quả
SELECT 'Migration completed successfully!' as message;
DESCRIBE users;




