START TRANSACTION;

-- Expand products schema to match frontend sample JSON
ALTER TABLE products
  ADD COLUMN slug VARCHAR(255) NULL,
  ADD COLUMN category VARCHAR(64) NULL,
  ADD COLUMN short_description TEXT NULL,
  ADD COLUMN original_price DECIMAL(10,2) NULL,
  ADD COLUMN colors JSON NULL,
  ADD COLUMN sizes JSON NULL,
  ADD COLUMN gallery JSON NULL,
  ADD COLUMN rating DECIMAL(3,1) NULL,
  ADD COLUMN reviews INT NULL,
  ADD COLUMN tags JSON NULL,
  ADD COLUMN is_featured TINYINT(1) DEFAULT 0,
  ADD COLUMN is_new TINYINT(1) DEFAULT 0,
  ADD INDEX idx_category (category),
  ADD INDEX idx_slug (slug),
  ADD UNIQUE KEY uq_products_slug (slug);

-- Merge orders: add required columns
ALTER TABLE orders
  ADD COLUMN orders_id VARCHAR(32) NULL AFTER id,
  ADD COLUMN products_name TEXT NULL,
  ADD COLUMN products_price DECIMAL(10,2) NULL,
  ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'pending',
  ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ADD INDEX idx_status (status);

-- Populate products_name and products_price from existing order_items (if any)
UPDATE orders o
LEFT JOIN (
  SELECT oi.order_id,
         GROUP_CONCAT(CONCAT(p.name, ' x', oi.qty) ORDER BY oi.id SEPARATOR ', ') AS pn,
         SUM(oi.qty * oi.price) AS total
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY oi.order_id
) agg ON agg.order_id = o.id
SET o.products_name = COALESCE(agg.pn, ''),
    o.products_price = COALESCE(agg.total, IFNULL(o.total_amount, 0));

-- Generate orders_id (ORD0001 ...)
UPDATE orders 
SET orders_id = CONCAT('ORD', LPAD(id, 4, '0'))
WHERE orders_id IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE orders
  MODIFY products_name TEXT NOT NULL,
  MODIFY products_price DECIMAL(10,2) NOT NULL;

-- Remove legacy columns/tables
ALTER TABLE orders DROP COLUMN total_amount;
DROP TABLE IF EXISTS order_items;

COMMIT;


