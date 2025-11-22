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

-- Product variants (extracted from shop.data.ts navigation links)
INSERT INTO product_variants (variant_name) VALUES
('Classic'), ('Modern cut'), ('Minimal'), ('Layered'),
('Daily wear'), ('Engagement'), ('Ceremony'),
('Full suits'), ('Vests'), ('Separates'),
('Office'), ('Black tie'),
('Ceremony gowns'), ('Reception dresses'), ('Engagement looks'),
('Lace'), ('Beading'), ('Minimal satin'),
('Column'), ('Mermaid'), ('A‑line'), ('Mini'),
('Gala'), ('Cocktail')
ON DUPLICATE KEY UPDATE variant_name=variant_name;


