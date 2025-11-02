-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

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

-- Products table (expanded to match frontend sample JSON)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL, -- maps to frontend product id (e.g., 'ao-dai-regal-crimson')
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
    INDEX idx_slug (slug),
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table (merged, single table)
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orders_id VARCHAR(32) UNIQUE,
    user_id INT NOT NULL,
    products_name TEXT NOT NULL,
    products_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- order_items removed after merging into orders
