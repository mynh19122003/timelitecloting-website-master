-- Lưu ý: MySQL KHÔNG cho phép update cùng bảng trong trigger (Error 1442).
-- Việc sinh user_code sẽ do ứng dụng đảm nhiệm sau khi INSERT.
-- File này chỉ đảm bảo rằng nếu có trigger cũ thì sẽ drop.

USE ecommerce_db;

DROP TRIGGER IF EXISTS tr_users_after_insert;


