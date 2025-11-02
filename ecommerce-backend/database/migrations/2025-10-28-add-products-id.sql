-- Add products_id column and backfill (cannot be generated from AUTO_INCREMENT in MySQL)
ALTER TABLE products ADD COLUMN products_id VARCHAR(16) NULL;

UPDATE products SET products_id = CONCAT('PID', LPAD(id, 4, '0')) WHERE products_id IS NULL;

ALTER TABLE products 
  MODIFY products_id VARCHAR(16) NOT NULL,
  ADD UNIQUE KEY uq_products_products_id (products_id);


