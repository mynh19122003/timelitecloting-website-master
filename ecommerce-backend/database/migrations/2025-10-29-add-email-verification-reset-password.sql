-- Migration: Add email verification and password reset fields
-- Date: 2025-10-29
-- Description: Thêm các cột để hỗ trợ xác thực email và reset mật khẩu

USE ecommerce_db;

-- Thêm cột email_verified (mặc định là 0 - chưa xác thực)
-- Cột password_hash đã có, nên thêm sau updated_at
ALTER TABLE users 
ADD COLUMN email_verified TINYINT(1) DEFAULT 0 AFTER updated_at;

-- Thêm cột reset_token để lưu token reset password
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) NULL AFTER email_verified;

-- Thêm cột reset_token_expiry để lưu thời gian hết hạn của token (15 phút)
ALTER TABLE users 
ADD COLUMN reset_token_expiry DATETIME NULL AFTER reset_token;

-- Thêm cột verification_token để lưu token xác thực email
ALTER TABLE users 
ADD COLUMN verification_token VARCHAR(255) NULL AFTER reset_token_expiry;

-- Thêm index để tăng tốc độ query
CREATE INDEX idx_reset_token ON users(reset_token);
CREATE INDEX idx_verification_token ON users(verification_token);

-- Hiển thị schema sau khi migrate
DESCRIBE users;

SELECT 'Migration completed successfully!' as message;

