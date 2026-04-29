import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file paths
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const ordersFile = path.join(dataDir, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// File operations utilities
const readJsonFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Saved data to ${filePath}`);
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
  }
};

// Load users from JSON file
let users = readJsonFile(usersFile);

// Load orders from JSON file
let orders = readJsonFile(ordersFile);

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tire_supply_db'
});

let dbConnected = false;

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    console.warn('MySQL is not available. Using JSON file storage for users and orders.');
    dbConnected = false;
    return;
  }
  dbConnected = true;
  console.log('Connected to MySQL database');
});

const requireDb = (res) => {
  if (!dbConnected) {
    res.status(503).json({
      error: 'Database not connected. Please set correct DB_USER/DB_PASSWORD in .env and restart.',
      code: 'DB_NOT_CONNECTED'
    });
    return false;
  }
  return true;
};

// Auth routes
app.post('/api/register', (req, res) => {
  const { email, password, role = 'user' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const newUser = { 
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1, 
    email, 
    password, 
    role,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeJsonFile(usersFile, users);
  res.json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email, role: newUser.role } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Simple token (in production, use JWT)
  const token = `token_${user.id}_${Date.now()}`;
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// Middleware to check auth
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // Simple token check (in production, verify JWT)
  const userId = token.split('_')[1];
  const user = users.find(u => u.id == userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = user;
  next();
};

// Get all products
app.get('/api/products', (req, res) => {
  if (!requireDb(res)) return;
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  if (!requireDb(res)) return;
  const query = 'SELECT * FROM products WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results[0]);
  });
});

// Create new product
app.post('/api/products', (req, res) => {
  if (!requireDb(res)) return;
  const { name, category, price, stock, description, image } = req.body;
  const query = 'INSERT INTO products (name, category, price, stock, description, image) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [name, category, price, stock, description, image], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: results.insertId, ...req.body });
  });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  if (!requireDb(res)) return;
  const { name, category, price, stock, description, image } = req.body;
  const query = 'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, description = ?, image = ? WHERE id = ?';
  db.query(query, [name, category, price, stock, description, image, req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, ...req.body });
  });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  if (!requireDb(res)) return;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Get all orders
app.get('/api/orders', requireAuth, (req, res) => {
  // Admin sees all orders, regular users see only their own
  const userOrders = req.user.role === 'admin' 
    ? orders 
    : orders.filter(o => o.user_id === req.user.id);
  res.json(userOrders.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// Get order by ID
app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  // Admin can view any order, users can only view their own
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized access to this order' });
  }
  res.json(order);
});

// Create new order
app.post('/api/orders', requireAuth, (req, res) => {
  // Prevent admin users from placing orders
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: 'Admins cannot place orders. Only regular users can order.' });
  }

  const { customer, email, phone, total, status = 'Processing', items } = req.body;
  
  if (!customer || !total || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer, email, total, and items are required' });
  }

  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    customer,
    email: email || req.user.email,
    phone: phone || '',
    user_id: req.user.id,
    total,
    status,
    date: new Date().toISOString(),
    items: items.map((item, idx) => ({
      id: idx + 1,
      product_name: item.name || item.product_name,
      quantity: item.quantity,
      price: item.price
    }))
  };

  orders.push(newOrder);
  writeJsonFile(ordersFile, orders);
  
  res.json(newOrder);
});

// Update order status
app.put('/api/orders/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id == req.params.id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Admin can update any order, users can only update their own
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized access to this order' });
  }

  order.status = status;
  writeJsonFile(ordersFile, orders);
  
  res.json({ id: order.id, status });
});

// Delete order
app.delete('/api/orders/:id', requireAuth, (req, res) => {
  const index = orders.findIndex(o => o.id == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = orders[index];
  
  // Admin can delete any order, users can only delete their own
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized access to this order' });
  }

  orders.splice(index, 1);
  writeJsonFile(ordersFile, orders);
  
  res.json({ message: 'Order deleted successfully' });
});

// Get dashboard stats
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  try {
    // Admin sees all stats, regular users see only their own
    const userOrders = req.user.role === 'admin' 
      ? orders 
      : orders.filter(o => o.user_id === req.user.id);

    const totalOrders = userOrders.length;
    const totalRevenue = userOrders.reduce((sum, order) => sum + order.total, 0);
    const totalProducts = userOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    const activeUsers = req.user.role === 'admin' 
      ? new Set(userOrders.map(o => o.customer)).size 
      : 1;

    res.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      activeUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Users data stored in: ${usersFile}`);
  console.log(`Orders data stored in: ${ordersFile}`);
});