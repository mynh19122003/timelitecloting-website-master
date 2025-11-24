START TRANSACTION;

-- Add email column if missing
SET @has_email := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='email');
SET @sql := IF(@has_email, 'ALTER TABLE orders ADD COLUMN email VARCHAR(255) NULL AFTER user_phone', 'SELECT 1');
PREPARE s1 FROM @sql; EXECUTE s1; DEALLOCATE PREPARE s1;

-- Add company column if missing
SET @has_company := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='company');
SET @sql := IF(@has_company, 'ALTER TABLE orders ADD COLUMN company VARCHAR(255) NULL AFTER email', 'SELECT 1');
PREPARE s2 FROM @sql; EXECUTE s2; DEALLOCATE PREPARE s2;

-- Add street_address column if missing
SET @has_street_address := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='street_address');
SET @sql := IF(@has_street_address, 'ALTER TABLE orders ADD COLUMN street_address VARCHAR(255) NULL AFTER company', 'SELECT 1');
PREPARE s3 FROM @sql; EXECUTE s3; DEALLOCATE PREPARE s3;

-- Add apartment column if missing
SET @has_apartment := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='apartment');
SET @sql := IF(@has_apartment, 'ALTER TABLE orders ADD COLUMN apartment VARCHAR(128) NULL AFTER street_address', 'SELECT 1');
PREPARE s4 FROM @sql; EXECUTE s4; DEALLOCATE PREPARE s4;

-- Add city column if missing
SET @has_city := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='city');
SET @sql := IF(@has_city, 'ALTER TABLE orders ADD COLUMN city VARCHAR(100) NULL AFTER apartment', 'SELECT 1');
PREPARE s5 FROM @sql; EXECUTE s5; DEALLOCATE PREPARE s5;

-- Add state column if missing
SET @has_state := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='state');
SET @sql := IF(@has_state, 'ALTER TABLE orders ADD COLUMN state VARCHAR(100) NULL AFTER city', 'SELECT 1');
PREPARE s6 FROM @sql; EXECUTE s6; DEALLOCATE PREPARE s6;

-- Add zip column if missing
SET @has_zip := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='zip');
SET @sql := IF(@has_zip, 'ALTER TABLE orders ADD COLUMN zip VARCHAR(20) NULL AFTER state', 'SELECT 1');
PREPARE s7 FROM @sql; EXECUTE s7; DEALLOCATE PREPARE s7;

-- Add country column if missing
SET @has_country := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='country');
SET @sql := IF(@has_country, 'ALTER TABLE orders ADD COLUMN country VARCHAR(100) NULL AFTER zip', 'SELECT 1');
PREPARE s8 FROM @sql; EXECUTE s8; DEALLOCATE PREPARE s8;

-- Add shipping_method column if missing
SET @has_shipping_method := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='shipping_method');
SET @sql := IF(@has_shipping_method, 'ALTER TABLE orders ADD COLUMN shipping_method VARCHAR(64) NULL AFTER country', 'SELECT 1');
PREPARE s9 FROM @sql; EXECUTE s9; DEALLOCATE PREPARE s9;

-- Add shipping_cost column if missing
SET @has_shipping_cost := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='shipping_cost');
SET @sql := IF(@has_shipping_cost, 'ALTER TABLE orders ADD COLUMN shipping_cost DECIMAL(10,2) NULL DEFAULT 0 AFTER shipping_method', 'SELECT 1');
PREPARE s10 FROM @sql; EXECUTE s10; DEALLOCATE PREPARE s10;

-- Add shipping_firstname column if missing
SET @has_shipping_firstname := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='shipping_firstname');
SET @sql := IF(@has_shipping_firstname, 'ALTER TABLE orders ADD COLUMN shipping_firstname VARCHAR(100) NULL AFTER shipping_cost', 'SELECT 1');
PREPARE s11 FROM @sql; EXECUTE s11; DEALLOCATE PREPARE s11;

-- Add shipping_lastname column if missing
SET @has_shipping_lastname := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='shipping_lastname');
SET @sql := IF(@has_shipping_lastname, 'ALTER TABLE orders ADD COLUMN shipping_lastname VARCHAR(100) NULL AFTER shipping_firstname', 'SELECT 1');
PREPARE s12 FROM @sql; EXECUTE s12; DEALLOCATE PREPARE s12;

-- Add shipping_company column if missing
SET @has_shipping_company := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='shipping_company');
SET @sql := IF(@has_shipping_company, 'ALTER TABLE orders ADD COLUMN shipping_company VARCHAR(255) NULL AFTER shipping_lastname', 'SELECT 1');
PREPARE s13 FROM @sql; EXECUTE s13; DEALLOCATE PREPARE s13;

-- Add shipping_address column if missing
SET @has_shipping_address := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='shipping_address');
SET @sql := IF(@has_shipping_address, 'ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(500) NULL AFTER shipping_company', 'SELECT 1');
PREPARE s14 FROM @sql; EXECUTE s14; DEALLOCATE PREPARE s14;

-- Add shipping_phone column if missing
SET @has_shipping_phone := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='shipping_phone');
SET @sql := IF(@has_shipping_phone, 'ALTER TABLE orders ADD COLUMN shipping_phone VARCHAR(32) NULL AFTER shipping_address', 'SELECT 1');
PREPARE s15 FROM @sql; EXECUTE s15; DEALLOCATE PREPARE s15;

-- Add billing_firstname column if missing
SET @has_billing_firstname := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='billing_firstname');
SET @sql := IF(@has_billing_firstname, 'ALTER TABLE orders ADD COLUMN billing_firstname VARCHAR(100) NULL AFTER shipping_phone', 'SELECT 1');
PREPARE s16 FROM @sql; EXECUTE s16; DEALLOCATE PREPARE s16;

-- Add billing_lastname column if missing
SET @has_billing_lastname := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='billing_lastname');
SET @sql := IF(@has_billing_lastname, 'ALTER TABLE orders ADD COLUMN billing_lastname VARCHAR(100) NULL AFTER billing_firstname', 'SELECT 1');
PREPARE s17 FROM @sql; EXECUTE s17; DEALLOCATE PREPARE s17;

-- Add billing_company column if missing
SET @has_billing_company := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='billing_company');
SET @sql := IF(@has_billing_company, 'ALTER TABLE orders ADD COLUMN billing_company VARCHAR(255) NULL AFTER billing_lastname', 'SELECT 1');
PREPARE s18 FROM @sql; EXECUTE s18; DEALLOCATE PREPARE s18;

-- Add billing_address column if missing
SET @has_billing_address := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='billing_address');
SET @sql := IF(@has_billing_address, 'ALTER TABLE orders ADD COLUMN billing_address VARCHAR(500) NULL AFTER billing_company', 'SELECT 1');
PREPARE s19 FROM @sql; EXECUTE s19; DEALLOCATE PREPARE s19;

-- Add billing_phone column if missing
SET @has_billing_phone := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='billing_phone');
SET @sql := IF(@has_billing_phone, 'ALTER TABLE orders ADD COLUMN billing_phone VARCHAR(32) NULL AFTER billing_address', 'SELECT 1');
PREPARE s20 FROM @sql; EXECUTE s20; DEALLOCATE PREPARE s20;

-- Add notes column if missing
SET @has_notes := (SELECT COUNT(*)=0 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='orders' AND COLUMN_NAME='notes');
SET @sql := IF(@has_notes, 'ALTER TABLE orders ADD COLUMN notes TEXT NULL AFTER status', 'SELECT 1');
PREPARE s21 FROM @sql; EXECUTE s21; DEALLOCATE PREPARE s21;

COMMIT;

