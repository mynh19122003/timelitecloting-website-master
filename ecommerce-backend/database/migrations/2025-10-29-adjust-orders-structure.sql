START TRANSACTION;

-- Rename orders_id -> order_id if exists
SET @has_old := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'orders_id');
SET @sql := IF(@has_old > 0, 'ALTER TABLE orders CHANGE COLUMN orders_id order_id VARCHAR(32) NULL', 'SELECT 1');
PREPARE s1 FROM @sql; EXECUTE s1; DEALLOCATE PREPARE s1;

-- Add user info and payment fields
-- Add columns if missing
SET @add_user_name := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='user_name');
SET @sql := IF(@add_user_name, 'ALTER TABLE orders ADD COLUMN user_name VARCHAR(255) NULL AFTER user_id', 'SELECT 1');
PREPARE s2 FROM @sql; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @add_user_address := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='user_address');
SET @sql := IF(@add_user_address, 'ALTER TABLE orders ADD COLUMN user_address VARCHAR(500) NULL AFTER user_name', 'SELECT 1');
PREPARE s3 FROM @sql; EXECUTE s3; DEALLOCATE PREPARE s3;

SET @add_user_phone := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='user_phone');
SET @sql := IF(@add_user_phone, 'ALTER TABLE orders ADD COLUMN user_phone VARCHAR(32) NULL AFTER user_address', 'SELECT 1');
PREPARE s4 FROM @sql; EXECUTE s4; DEALLOCATE PREPARE s4;

SET @add_total_price := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='total_price');
SET @sql := IF(@add_total_price, 'ALTER TABLE orders ADD COLUMN total_price DECIMAL(10,2) NULL AFTER products_price', 'SELECT 1');
PREPARE s5 FROM @sql; EXECUTE s5; DEALLOCATE PREPARE s5;

SET @add_payment_method := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='payment_method');
SET @sql := IF(@add_payment_method, 'ALTER TABLE orders ADD COLUMN payment_method VARCHAR(32) NULL AFTER total_price', 'SELECT 1');
PREPARE s6 FROM @sql; EXECUTE s6; DEALLOCATE PREPARE s6;

-- Rename timestamps
-- Rename timestamps if old names exist
SET @has_created_at := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='created_at');
SET @sql := IF(@has_created_at>0, 'ALTER TABLE orders CHANGE COLUMN created_at create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE s7 FROM @sql; EXECUTE s7; DEALLOCATE PREPARE s7;

SET @has_updated_at := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='updated_at');
SET @sql := IF(@has_updated_at>0, 'ALTER TABLE orders CHANGE COLUMN updated_at update_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE s8 FROM @sql; EXECUTE s8; DEALLOCATE PREPARE s8;

-- Backfill order_id format (ORD + 5 digits)
UPDATE orders SET order_id = CONCAT('ORD', LPAD(id, 5, '0')) WHERE order_id IS NULL OR order_id = '';

-- Optional: drop products_name if column exists (MySQL 8 doesn't support IF EXISTS on DROP COLUMN)
SET @col_exists := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'products_name');
SET @sql := IF(@col_exists > 0, 'ALTER TABLE orders DROP COLUMN products_name', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

COMMIT;


