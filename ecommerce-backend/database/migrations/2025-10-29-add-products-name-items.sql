START TRANSACTION;

-- Add columns to display ordered product information
ALTER TABLE orders
  ADD COLUMN products_name TEXT NULL AFTER user_phone,
  ADD COLUMN products_items JSON NULL AFTER products_name;

COMMIT;


