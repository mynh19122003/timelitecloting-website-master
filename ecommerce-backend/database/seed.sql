-- Sample data for testing
USE ecommerce_db;

-- Insert sample products
INSERT INTO products (name, description, price, stock, image_url) VALUES
('Áo thun nam', 'Áo thun cotton 100% chất lượng cao', 150000, 100, '/images/ao-thun-nam.jpg'),
('Quần jean nữ', 'Quần jean slim fit thời trang', 350000, 50, '/images/quan-jean-nu.jpg'),
('Giày sneaker', 'Giày thể thao đa năng', 500000, 30, '/images/giay-sneaker.jpg'),
('Túi xách da', 'Túi xách da thật cao cấp', 800000, 20, '/images/tui-xach-da.jpg'),
('Đồng hồ nam', 'Đồng hồ cơ automatic', 1200000, 15, '/images/dong-ho-nam.jpg'),
('Váy dạ hội', 'Váy dạ hội sang trọng', 600000, 25, '/images/vay-da-hoi.jpg'),
('Áo khoác nữ', 'Áo khoác gió chống nước', 400000, 40, '/images/ao-khoac-nu.jpg'),
('Quần short nam', 'Quần short thể thao', 200000, 60, '/images/quan-short-nam.jpg');

-- Insert sample users (passwords are hashed with bcrypt for 'password123')
INSERT INTO users (email, password_hash) VALUES
('admin@example.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV'),
('user1@example.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV'),
('user2@example.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV');
