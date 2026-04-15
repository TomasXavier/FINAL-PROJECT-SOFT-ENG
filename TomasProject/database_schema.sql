-- Create Database
CREATE DATABASE IF NOT EXISTS tire_supply_db;
USE tire_supply_db;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    description TEXT,
    image VARCHAR(255) DEFAULT '🚗',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('Processing', 'Shipped', 'Delivered') DEFAULT 'Processing',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert Sample Products
INSERT INTO products (name, category, price, stock, description, image) VALUES
('Michelin Pilot Sport 4S', 'Performance', 16745.00, 15, 'Ultra-high performance tire for sports cars', '🚗'),
('Bridgestone Turanza T005', 'Touring', 10735.00, 8, 'Premium touring tire with excellent comfort', '🚙'),
('Continental ExtremeContact Sport', 'Performance', 13795.00, 12, 'Maximum grip and handling for performance driving', '🏎️'),
('Goodyear Eagle F1 Asymmetric 3', 'Performance', 10995.00, 20, 'Advanced performance tire for luxury vehicles', '🚗'),
('Pirelli P Zero', 'Performance', 15495.00, 10, 'Flagship performance tire with racing heritage', '🏁'),
('Michelin Defender T+H', 'All-Season', 8795.00, 25, 'Reliable all-season tire for everyday driving', '🚐');

-- Insert Sample Orders
INSERT INTO orders (customer, total, status, date) VALUES
('Tyron', 32740.00, 'Processing', '2024-03-20'),
('Dexter', 13795.00, 'Shipped', '2024-03-19'),
('Hiroki', 10995.00, 'Delivered', '2024-03-18');

-- Insert Sample Order Items
INSERT INTO order_items (order_id, product_name, quantity, price) VALUES
(1, 'Michelin Pilot Sport 4S', 2, 16745.00),
(1, 'Bridgestone Turanza T005', 1, 10735.00),
(2, 'Continental ExtremeContact Sport', 1, 13795.00),
(3, 'Goodyear Eagle F1 Asymmetric 3', 1, 10995.00);