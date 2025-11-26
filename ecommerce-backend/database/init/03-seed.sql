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

-- Product variants grouped by category
INSERT INTO product_variants (variant_name, category_slug, sort_order) VALUES
('Ao Dai (All)', 'ao-dai', 1),
('Bridal Ao Dai', 'ao-dai', 2),
('Designer Ao Dai (Women)', 'ao-dai', 3),
('Traditional Ao Dai (Women)', 'ao-dai', 4),
('Modern Ao Dai (Women)', 'ao-dai', 5),
('Ceremonial Nhạc Bình (Women)', 'ao-dai', 6),
('Five-Panel Ao Dai (Women)', 'ao-dai', 7),
('Girls’ Ao Dai', 'ao-dai', 8),
('Mother & Daughter Matching Ao Dai', 'ao-dai', 9),
('Modern Ao Dai (Men)', 'ao-dai', 10),
('Designer Ao Dai (Men)', 'ao-dai', 11),
('Five-Panel Ao Dai (Men)', 'ao-dai', 12),
('Ceremonial Nhạc Bình (Men)', 'ao-dai', 13),
('Father & Son Matching Ao Dai', 'ao-dai', 14),

('Men’s Suits', 'suits', 1),
('Women’s Suits', 'suits', 2),

('Wedding Dresses', 'bridal-formal-dresses', 1),
('Party & Gala Dresses', 'bridal-formal-dresses', 2),
('Pageant Dresses', 'bridal-formal-dresses', 3),
('Bridesmaid Dresses', 'bridal-formal-dresses', 4),

('Conical Hats', 'accessories', 1),
('Evening Bags & Clutches', 'accessories', 2),
('Wooden Sandals', 'accessories', 3),
('Statement Collars', 'accessories', 4),
('Traditional Turbans', 'accessories', 5),
('Heels & Dress Shoes', 'accessories', 6),

('Backdrops & Photo Walls', 'lunar-new-year-decor', 1),
('Yellow Mai Blossoms', 'lunar-new-year-decor', 2),
('Peach Blossoms', 'lunar-new-year-decor', 3),
('Calligraphy Panels', 'lunar-new-year-decor', 4),
('Red Envelopes', 'lunar-new-year-decor', 5),
('Lanterns', 'lunar-new-year-decor', 6),

('Women’s Temple Robes', 'ceremonial-attire', 1),
('Women’s Pilgrimage Ao Dai', 'ceremonial-attire', 2),
('Women’s “Ba Ba” Sets', 'ceremonial-attire', 3),
('Girls’ “Ba Ba” Sets', 'ceremonial-attire', 4),
('Men’s Casual “Ba Ba”', 'ceremonial-attire', 5),
('Men’s “Ba Ba” Sets', 'ceremonial-attire', 6),
('Men’s Temple Ao Dai', 'ceremonial-attire', 7),

('School Uniforms', 'uniforms-teamwear', 1),
('Choir & Church Uniforms', 'uniforms-teamwear', 2),
('Youth Group / Team Uniforms', 'uniforms-teamwear', 3),
('Restaurant Uniforms', 'uniforms-teamwear', 4),
('Retail Uniforms', 'uniforms-teamwear', 5),
('Factory & Workshop Uniforms', 'uniforms-teamwear', 6),
('Student Uniforms', 'uniforms-teamwear', 7)
ON DUPLICATE KEY UPDATE variant_name=variant_name;


