import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
    console.warn('MySQL is not available. API requests will return 503 until DB credentials are fixed.');
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

// In-memory users for demo (since DB not connected)
let users = [
  { id: 1, email: 'admin@tomas.com', password: 'admin123', role: 'admin' },
  { id: 2, email: 'user@tomas.com', password: 'user123', role: 'user' }
];

// Auth routes
app.post('/api/register', (req, res) => {
  const { email, password, role = 'user' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const newUser = { id: users.length + 1, email, password, role };
  users.push(newUser);
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
  if (!requireDb(res)) return;
  const query = 'SELECT * FROM orders ORDER BY date DESC';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  if (!requireDb(res)) return;
  const query = 'SELECT * FROM orders WHERE id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results[0]);
  });
});

// Create new order
app.post('/api/orders', (req, res) => {
  if (!requireDb(res)) return;
  const { customer, total, status, items } = req.body;
  const query = 'INSERT INTO orders (customer, total, status, date) VALUES (?, ?, ?, NOW())';
  db.query(query, [customer, total, status], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Insert order items
    const orderId = results.insertId;
    const itemPromises = items.map(item => {
      return new Promise((resolve, reject) => {
        const itemQuery = 'INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)';
        db.query(itemQuery, [orderId, item.name, item.quantity, item.price], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    Promise.all(itemPromises)
      .then(() => {
        res.json({ id: orderId, ...req.body, date: new Date() });
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  if (!requireDb(res)) return;
  const { status } = req.body;
  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(query, [status, req.params.id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, status });
  });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  if (!requireDb(res)) return;
  // First delete order items
  const deleteItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
  db.query(deleteItemsQuery, [req.params.id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Then delete the order
    const deleteOrderQuery = 'DELETE FROM orders WHERE id = ?';
    db.query(deleteOrderQuery, [req.params.id], (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Order deleted successfully' });
    });
  });
});

// Get dashboard stats
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  if (!requireDb(res)) return;
  const queries = {
    totalOrders: 'SELECT COUNT(*) as count FROM orders',
    totalRevenue: 'SELECT SUM(total) as revenue FROM orders',
    totalProducts: 'SELECT SUM(stock) as products FROM products',
    activeUsers: 'SELECT COUNT(DISTINCT customer) as users FROM orders'
  };

  const results = {};

  const promises = Object.keys(queries).map(key => {
    return new Promise((resolve, reject) => {
      db.query(queries[key], (err, result) => {
        if (err) reject(err);
        else {
          results[key] = result[0];
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json({
        totalOrders: results.totalOrders.count,
        totalRevenue: results.totalRevenue.revenue || 0,
        totalProducts: results.totalProducts.products || 0,
        activeUsers: results.activeUsers.users
      });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});