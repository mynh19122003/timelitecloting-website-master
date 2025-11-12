DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admin;

-- Users table (mandatory minimal structure)
CREATE TABLE users (
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

-- Admin table (for admin-backend-node auth)
CREATE TABLE admin (
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

-- Products table (compat với PHP backend và dữ liệu frontend)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    products_id VARCHAR(32) UNIQUE NOT NULL, -- mã nội bộ (PID0001 ...) hoặc id chuỗi từ frontend
    slug VARCHAR(255) UNIQUE NULL,           -- có thể trùng id chuỗi từ frontend
    name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NULL,
    short_description TEXT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2) NULL,
    stock INT NOT NULL DEFAULT 0,
    colors JSON NULL,
    sizes JSON NULL,
    image_url VARCHAR(500) NULL,
    gallery JSON NULL,
    rating DECIMAL(3,1) NULL,
    reviews INT NULL,
    tags JSON NULL,
    is_featured TINYINT(1) DEFAULT 0,
    is_new TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_id (products_id),
    INDEX idx_slug (slug),
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table (merged model, giữ các cột PHP backend đang dùng)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) UNIQUE,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NULL,
    user_address VARCHAR(500) NULL,
    user_phone VARCHAR(32) NULL,
    products_name TEXT NULL,
    products_items JSON NULL,
    products_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NULL,
    payment_method VARCHAR(32) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (create_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- (Tùy chọn) order_items cho tương thích ngược
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    qty INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
