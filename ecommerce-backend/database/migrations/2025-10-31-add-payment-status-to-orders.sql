START TRANSACTION;

-- Add payment_status column if missing
SET @has_payment_status := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'payment_status'
);
SET @sql := IF(@has_payment_status = 0,
  'ALTER TABLE orders ADD COLUMN payment_status VARCHAR(16) NOT NULL DEFAULT \'unpaid\' AFTER payment_method',
  'SELECT 1'
);
PREPARE s1 FROM @sql; EXECUTE s1; DEALLOCATE PREPARE s1;

-- Backfill based on payment_method when column was newly added
-- If payment_method is bank_transfer then paid, else unpaid
UPDATE orders 
SET payment_status = CASE 
  WHEN payment_method = 'bank_transfer' THEN 'paid' 
  ELSE 'unpaid' 
END;

-- Optional index for common queries
SET @has_idx := (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_payment_status'
);
SET @sql := IF(@has_idx = 0,
  'ALTER TABLE orders ADD INDEX idx_payment_status (payment_status)',
  'SELECT 1'
);
PREPARE s2 FROM @sql; EXECUTE s2; DEALLOCATE PREPARE s2;

COMMIT;


