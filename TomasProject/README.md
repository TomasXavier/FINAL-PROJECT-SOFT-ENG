# TireSupply Pro - Web-Based Ordering System

A full-stack React application for tire supply management with MySQL database integration.

## 🚀 Features

- **Product Catalog**: Browse and filter tires by category
- **Shopping Cart**: Add products to cart with real-time total calculation
- **Order Management**: View order history and track status
- **Admin Dashboard**: Complete CRUD operations for products and orders
- **MySQL Integration**: Persistent data storage with backend API
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Styling**: Custom CSS with modern design

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **MySQL Server** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
3. **Git** (optional, for cloning)

## 🔧 Installation & Setup

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd TomasProject
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MySQL Database

#### Option A: Using MySQL Command Line
```bash
# Login to MySQL
mysql -u root -p

# Run the database schema
source database_schema.sql
```

#### Option B: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the `database_schema.sql` file
4. Execute the SQL script

### 4. Configure Environment Variables

Edit the `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=tire_supply_db

# Server Configuration
PORT=3001
```

**Replace `your_mysql_password_here` with your actual MySQL root password.**

### 5. Start the Application

#### Development Mode (Recommended)
This runs both the backend server and React frontend simultaneously:

```bash
npm start
```

#### Manual Mode
If you prefer to run them separately:

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - React Frontend:**
```bash
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173 (or next available port)
- **Backend API**: http://localhost:3001

## 📊 Database Schema

The application uses three main tables:

### `products`
- `id` (Primary Key)
- `name` (Product name)
- `category` (Performance, Touring, All-Season)
- `price` (Decimal)
- `stock` (Integer)
- `description` (Text)
- `image` (Emoji/icon)

### `orders`
- `id` (Primary Key)
- `customer` (Customer name)
- `total` (Order total)
- `status` (Processing, Shipped, Delivered)
- `date` (Order date)

### `order_items`
- `id` (Primary Key)
- `order_id` (Foreign Key to orders)
- `product_name` (Product name)
- `quantity` (Integer)
- `price` (Unit price)

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm run server
```

### Frontend Deployment
```bash
# Build React app
npm run build

# Serve built files (you'll need a static file server)
```

## 🐛 Troubleshooting

### Common Issues:

1. **MySQL Connection Error**
   - Check if MySQL server is running
   - Verify credentials in `.env` file
   - Ensure database `tire_supply_db` exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using the port: `npx kill-port 3001`

3. **CORS Errors**
   - Backend runs on port 3001, frontend on 5173
   - CORS is enabled in the server configuration

4. **Database Tables Not Found**
   - Re-run the `database_schema.sql` script
   - Check MySQL user permissions

## 📝 Development Notes

- **Hot Reload**: Frontend changes auto-refresh in development
- **API Calls**: All data operations go through the backend API
- **State Management**: React hooks manage local component state
- **Error Handling**: Try-catch blocks handle API failures gracefully

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Happy coding! 🎯**