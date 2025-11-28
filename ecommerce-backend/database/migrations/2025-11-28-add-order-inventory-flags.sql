START TRANSACTION;

-- Add inventory_reverted column to mark whether stock was returned for an order
SET @has_inventory_reverted := (
  SELECT COUNT(*) = 0
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'inventory_reverted'
);
SET @sql := IF(
  @has_inventory_reverted,
  'ALTER TABLE orders ADD COLUMN inventory_reverted TINYINT(1) NOT NULL DEFAULT 0 AFTER status',
  'SELECT 1'
);
PREPARE add_inventory_reverted FROM @sql;
EXECUTE add_inventory_reverted;
DEALLOCATE PREPARE add_inventory_reverted;

COMMIT;

