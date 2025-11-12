-- Create admin table (idempotent) and seed a default admin
USE ecommerce_db;

CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(32) UNIQUE,
    admin_email VARCHAR(255) UNIQUE NOT NULL,
    admin_name VARCHAR(255) NULL,
    admin_password VARCHAR(255) NOT NULL,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_email (admin_email),
    INDEX idx_admin_id (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed: default admin (password will be upgraded to bcrypt on first login)
INSERT INTO admin (admin_id, admin_email, admin_name, admin_password)
VALUES ('ADM0001', 'admin@example.com', 'Administrator', 'Admin@123')
ON DUPLICATE KEY UPDATE admin_email = VALUES(admin_email);


