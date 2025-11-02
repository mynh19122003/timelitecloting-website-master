UPDATE products SET products_id = CONCAT('PID', LPAD(id, 4, '0')) WHERE products_id IS NULL;
ALTER TABLE products MODIFY products_id VARCHAR(16) NOT NULL;


