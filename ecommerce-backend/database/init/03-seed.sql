-- Seed initial data (optional)
USE ecommerce_db;

-- Products (minimal required columns)
INSERT INTO products (slug, name, price, stock, image_url) VALUES
('ao-thun-nam', 'Áo thun nam', 150000, 100, '/images/ao-thun-nam.jpg'),
('quan-jean-nu', 'Quần jean nữ', 350000, 50, '/images/quan-jean-nu.jpg'),
('giay-sneaker', 'Giày sneaker', 500000, 30, '/images/giay-sneaker.jpg');

-- Admin
INSERT INTO admin (admin_id, admin_email, admin_name, admin_password) VALUES
('ADM-0001', 'admin@gmail.com', 'Super Admin', '19122003');


