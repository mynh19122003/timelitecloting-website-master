-- Add payment_status column and backfill basic values
-- Safe add: only adds if column does not exist

SET @missing_payment_status := (
  SELECT COUNT(*) = 0
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'payment_status'
);

SET @add_payment_status_sql := IF(
  @missing_payment_status,
  'ALTER TABLE orders ADD COLUMN payment_status VARCHAR(32) NULL DEFAULT \''pending\'' AFTER payment_method',
  'SELECT 1'
);

PREPARE stmt FROM @add_payment_status_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill heuristic: paid if fulfilled-like, cancelled maps through, otherwise pending
UPDATE orders
SET payment_status = CASE
  WHEN payment_status IS NOT NULL THEN payment_status
  WHEN status IN ('confirmed','shipped','delivered') THEN 'paid'
  WHEN status IN ('cancelled') THEN 'cancelled'
  ELSE 'pending'
END;


