-- Triggers for user_code generation
-- BẮT BUỘC sử dụng MySQL - KHÔNG được thay thế bởi engine khác

USE ecommerce_db;

DELIMITER $$

-- AFTER INSERT trigger to generate user_code if NULL
DROP TRIGGER IF EXISTS tr_users_after_insert$$
CREATE TRIGGER tr_users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.user_code IS NULL OR NEW.user_code = '' THEN
        UPDATE users 
        SET user_code = CONCAT('UID', LPAD(NEW.id, 5, '0'))
        WHERE id = NEW.id;
    END IF;
END$$

DELIMITER ;
