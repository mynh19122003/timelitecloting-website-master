-- Migration: Ensure email verification fields exist in users table
-- Date: 2025-01-15
-- Description: Đảm bảo các cột email_verified và verification_token tồn tại trong bảng users
-- Safe to run multiple times (idempotent)

USE ecommerce_db;

-- Kiểm tra và thêm cột email_verified nếu chưa có
SET @has_email_verified := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'email_verified'
);

SET @sql_email_verified := IF(
  @has_email_verified = 0,
  'ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 0 AFTER updated_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql_email_verified;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra và thêm cột verification_token nếu chưa có
SET @has_verification_token := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'verification_token'
);

SET @sql_verification_token := IF(
  @has_verification_token = 0,
  'ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL AFTER reset_token_expiry',
  'SELECT 1'
);
PREPARE stmt FROM @sql_verification_token;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra và thêm index cho verification_token nếu chưa có
SET @has_verification_index := (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND INDEX_NAME = 'idx_verification_token'
);

SET @sql_verification_index := IF(
  @has_verification_index = 0,
  'CREATE INDEX idx_verification_token ON users(verification_token)',
  'SELECT 1'
);
PREPARE stmt FROM @sql_verification_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Hiển thị kết quả
SELECT 'Migration completed successfully!' as message;
DESCRIBE users;




