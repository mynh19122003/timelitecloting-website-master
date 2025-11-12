-- Idempotent repair script: tạo bảng thiếu và thêm cột còn thiếu để khớp backend
USE ecommerce_db;

-- Admin table
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(32) UNIQUE,
  admin_email VARCHAR(255) UNIQUE NOT NULL,
  admin_name VARCHAR(255) NULL,
  admin_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admin_email (admin_email),
  INDEX idx_admin_id (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table (ensure minimal columns)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_code VARCHAR(16) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_name VARCHAR(255) NULL,
  user_phone VARCHAR(32) NULL,
  user_address VARCHAR(500) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_user_code (user_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table and columns
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE products ADD COLUMN products_id VARCHAR(32) UNIQUE;
ALTER TABLE products ADD COLUMN slug VARCHAR(255) UNIQUE;
ALTER TABLE products ADD COLUMN name VARCHAR(255);
ALTER TABLE products ADD COLUMN category VARCHAR(64);
ALTER TABLE products ADD COLUMN short_description TEXT;
ALTER TABLE products ADD COLUMN description TEXT;
ALTER TABLE products ADD COLUMN price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN colors JSON;
ALTER TABLE products ADD COLUMN sizes JSON;
ALTER TABLE products ADD COLUMN image_url VARCHAR(500);
ALTER TABLE products ADD COLUMN gallery JSON;
ALTER TABLE products ADD COLUMN rating DECIMAL(3,1);
ALTER TABLE products ADD COLUMN reviews INT;
ALTER TABLE products ADD COLUMN tags JSON;
ALTER TABLE products ADD COLUMN is_featured TINYINT(1) DEFAULT 0;
ALTER TABLE products ADD COLUMN is_new TINYINT(1) DEFAULT 0;
ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Orders table and columns (merged model)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE orders ADD COLUMN order_id VARCHAR(32) UNIQUE;
ALTER TABLE orders ADD COLUMN user_id INT NOT NULL;
ALTER TABLE orders ADD COLUMN user_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN user_address VARCHAR(500);
ALTER TABLE orders ADD COLUMN user_phone VARCHAR(32);
ALTER TABLE orders ADD COLUMN products_name TEXT;
ALTER TABLE orders ADD COLUMN products_items JSON;
ALTER TABLE orders ADD COLUMN products_price DECIMAL(10,2) NOT NULL;
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(32);
ALTER TABLE orders ADD COLUMN total_price DECIMAL(10,2) NOT NULL;
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(32);
ALTER TABLE orders ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN update_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- FK users -> orders
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Seed default admin if missing (plaintext; Node sẽ auto nâng cấp bcrypt lần login đầu)
INSERT INTO admin (admin_id, admin_email, admin_name, admin_password)
SELECT 'ADM0001', 'admin@example.com', 'Administrator', 'Admin@123'
WHERE NOT EXISTS (SELECT 1 FROM admin WHERE admin_email = 'admin@example.com');


