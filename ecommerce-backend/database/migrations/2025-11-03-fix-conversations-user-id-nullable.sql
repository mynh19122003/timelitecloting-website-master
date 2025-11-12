-- Fix conversations table to allow NULL user_id for guest users
-- This migration updates the existing schema if it was created with NOT NULL constraint

USE ecommerce_db;

-- Check if conversations table exists and modify user_id to allow NULL
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'ecommerce_db' 
    AND table_name = 'conversations'
);

SET @sql = IF(@table_exists > 0,
    'ALTER TABLE conversations MODIFY COLUMN user_id INT NULL, MODIFY FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;',
    'SELECT "Table conversations does not exist yet. Run 2025-11-02-create-conversations-messages.sql first." as message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration completed successfully!' as message;


