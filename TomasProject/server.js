import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultProducts } from './src/defaultProducts.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static('dist'));

// Data file paths
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const ordersFile = path.join(dataDir, 'orders.json');
const productsFile = path.join(dataDir, 'products.json');

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

// Load products from JSON file, seeding it from the shared defaults on first run.
let products = readJsonFile(productsFile);
if (products.length === 0) {
  products = defaultProducts;
  writeJsonFile(productsFile, products);
}

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

const findUserById = (userId) => users.find(u => u.id == userId);

const enrichOrder = (order) => {
  const orderUser = findUserById(order.user_id);
  return {
    ...order,
    customer: order.customer || orderUser?.email || 'Unknown customer',
    email: order.email || orderUser?.email || '',
    items: Array.isArray(order.items) ? order.items : []
  };
};

const normalizeProductPayload = (body) => ({
  name: String(body.name || '').trim(),
  category: String(body.category || '').trim(),
  price: Number(body.price) || 0,
  stock: Number(body.stock) || 0,
  description: body.description || '',
  image: body.image || '',
  rating: Number(body.rating) || 0
});

const getPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt || null,
  lastLogin: user.lastLogin || null
});

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
  user.lastLogin = new Date().toISOString();
  writeJsonFile(usersFile, users);
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

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users for admin dashboard
app.get('/api/users', requireAuth, requireAdmin, (req, res) => {
  const userSummaries = users.map(user => {
    const userOrders = orders.filter(order => order.user_id == user.id);
    const totalSpent = userOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

    return {
      ...getPublicUser(user),
      orderCount: userOrders.length,
      totalSpent
    };
  });

  res.json(userSummaries.sort((a, b) => {
    const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
    const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
    return bTime - aTime;
  }));
});

// Get all products
app.get('/api/products', (req, res) => {
  if (!dbConnected) {
    return res.json(products);
  }
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
  if (!dbConnected) {
    const product = products.find(p => p.id == req.params.id);
    return product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
  }
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
  const productData = normalizeProductPayload(req.body);

  if (!productData.name || !productData.category) {
    return res.status(400).json({ error: 'Product name and category are required' });
  }

  if (!dbConnected) {
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1,
      ...productData
    };
    products.push(newProduct);
    writeJsonFile(productsFile, products);
    return res.status(201).json(newProduct);
  }

  const { name, category, price, stock, description, image } = productData;
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
  const productData = normalizeProductPayload(req.body);

  if (!productData.name || !productData.category) {
    return res.status(400).json({ error: 'Product name and category are required' });
  }

  if (!dbConnected) {
    const index = products.findIndex(p => p.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products[index] = { ...products[index], ...productData, id: products[index].id };
    writeJsonFile(productsFile, products);
    return res.json(products[index]);
  }

  const { name, category, price, stock, description, image } = productData;
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
  if (!dbConnected) {
    const index = products.findIndex(p => p.id == req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products.splice(index, 1);
    writeJsonFile(productsFile, products);
    return res.json({ message: 'Product deleted successfully' });
  }
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
  res.json(userOrders.map(enrichOrder).sort((a, b) => new Date(b.date) - new Date(a.date)));
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
  res.json(enrichOrder(order));
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
      product_id: item.id || item.product_id || null,
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

// Update order details
app.put('/api/orders/:id', requireAuth, (req, res) => {
  const order = orders.find(o => o.id == req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized access to this order' });
  }

  const { customer, email, phone, total, status, date, items } = req.body;

  order.customer = customer || order.customer;
  order.email = email ?? order.email;
  order.phone = phone ?? order.phone;
  order.total = Number(total) || order.total;
  order.status = status || order.status;
  order.date = date || order.date;

  if (Array.isArray(items)) {
    order.items = items.map((item, idx) => ({
      id: item.id || idx + 1,
      product_id: item.product_id || item.id || null,
      product_name: item.product_name || item.name,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0
    }));
  }

  writeJsonFile(ordersFile, orders);

  res.json(enrichOrder(order));
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
    const totalProducts = dbConnected ? userOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0) : products.length;
    const activeUsers = req.user.role === 'admin' 
      ? users.filter(user => user.lastLogin).length 
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

// Serve React app for any unmatched routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Users data stored in: ${usersFile}`);
  console.log(`Orders data stored in: ${ordersFile}`);
});
