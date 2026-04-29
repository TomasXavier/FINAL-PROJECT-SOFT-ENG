-- Create Database
CREATE DATABASE IF NOT EXISTS tire_supply_db;
USE tire_supply_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
    email VARCHAR(255),
    phone VARCHAR(20),
    user_id INT,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('Processing', 'Shipped', 'Delivered') DEFAULT 'Processing',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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

-- Insert Sample Users
INSERT INTO users (email, password, role) VALUES
('admin@tomas.com', 'admin123', 'admin'),
('user@tomas.com', 'user123', 'user'),
('tyron@example.com', 'password123', 'user'),
('dexter@example.com', 'password123', 'user'),
('hiroki@example.com', 'password123', 'user');

-- Insert Sample Products
INSERT INTO products (name, category, price, stock, description, image) VALUES
('Michelin Pilot Sport 4S', 'Performance', 16745.00, 15, 'Ultra-high performance tire for sports cars', '🚗'),
('Bridgestone Turanza T005', 'Touring', 10735.00, 8, 'Premium touring tire with excellent comfort', '🚙'),
('Continental ExtremeContact Sport', 'Performance', 13795.00, 12, 'Maximum grip and handling for performance driving', '🏎️'),
('Goodyear Eagle F1 Asymmetric 3', 'Performance', 10995.00, 20, 'Advanced performance tire for luxury vehicles', '🚗'),
('Pirelli P Zero', 'Performance', 15495.00, 10, 'Flagship performance tire with racing heritage', '🏁'),
('Michelin Defender T+H', 'All-Season', 8795.00, 25, 'Reliable all-season tire for everyday driving', '🚐');

-- Insert Sample Orders with Customer Contact Info
INSERT INTO orders (customer, email, phone, user_id, total, status, date) VALUES
('Tyron', 'tyron@example.com', '+1-234-567-8901', 3, 32740.00, 'Processing', '2024-03-20 10:30:00'),
('Dexter', 'dexter@example.com', '+1-234-567-8902', 4, 13795.00, 'Shipped', '2024-03-19 14:15:00'),
('Hiroki', 'hiroki@example.com', '+1-234-567-8903', 5, 10995.00, 'Delivered', '2024-03-18 09:45:00');

-- Insert Sample Order Items
INSERT INTO order_items (order_id, product_name, quantity, price) VALUES
(1, 'Michelin Pilot Sport 4S', 2, 16745.00),
(1, 'Bridgestone Turanza T005', 1, 10735.00),
(2, 'Continental ExtremeContact Sport', 1, 13795.00),
(3, 'Goodyear Eagle F1 Asymmetric 3', 1, 10995.00);