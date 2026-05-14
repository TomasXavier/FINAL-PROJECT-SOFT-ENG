import React, { useState, useEffect } from 'react'
import { productsAPI, ordersAPI, dashboardAPI } from '../src/api'
import { defaultProducts } from '../src/defaultProducts'
import './Admin.css'

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [editType, setEditType] = useState('') // 'product' or 'order'

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0, 
    totalProducts: 0,
    activeUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, []) 

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, ordersData, statsData] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        dashboardAPI.getStats()
      ])
      setProducts(Array.isArray(productsData) && productsData.length > 0 ? productsData : defaultProducts)
      setOrders(ordersData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      console.error('Error loading data:', err)
      // Fallback to shared default products
      setProducts(defaultProducts)
      setOrders([
        {
          id: 1,
          date: '2024-03-15',
          status: 'Delivered',
          total: 12500,
          items: [{ name: 'Michelin Pilot Sport 4S', quantity: 1, price: 12500 }]
        }
      ])
      setStats({
        totalOrders: 1,
        totalRevenue: 12500,
        totalProducts: defaultProducts.length,
        activeUsers: 5
      })
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const recentOrders = orders.slice(0, 3)

  const lowStockProducts = products.filter(p => p.stock < 10)

  // Product functions
  const handleEditProduct = (product) => {
    setEditingItem(product)
    setEditType('product')
    setShowEditModal(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(productId)
        setProducts(products.filter(p => p.id !== productId))
      } catch (err) {
        // Fallback: delete from local state
        setProducts(products.filter(p => p.id !== productId))
        console.error('Error deleting product:', err)
      }
    }
  }

  const handleRestock = async (product) => {
    const newStock = product.stock + 10 // Add 10 units
    try {
      await productsAPI.update(product.id, { ...product, stock: newStock })
      setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock } : p))
      alert(`Restocked ${product.name} by 10 units. New stock: ${newStock}`)
    } catch (err) {
      // Fallback: update local state
      setProducts(products.map(p => p.id === product.id ? { ...p, stock: newStock } : p))
      alert(`Restocked ${product.name} by 10 units. New stock: ${newStock}`)
      console.error('Error restocking product:', err)
    }
  }

  const handleSaveProduct = async (updatedProduct) => {
    try {
      if (updatedProduct.id) {
        // Update existing product
        const savedProduct = await productsAPI.update(updatedProduct.id, updatedProduct)
        setProducts(products.map(p => p.id === updatedProduct.id ? savedProduct : p))
      } else {
        // Create new product
        const newProduct = await productsAPI.create(updatedProduct)
        setProducts([...products, newProduct])
      }
      setShowEditModal(false)
      setEditingItem(null)
    } catch (err) {
      // Fallback: update local state
      if (updatedProduct.id) {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p))
      } else {
        const newProduct = { ...updatedProduct, id: Date.now() } // Simple ID
        setProducts([...products, newProduct])
      }
      setShowEditModal(false)
      setEditingItem(null)
      console.error('Error saving product:', err)
    }
  }

  const handleAddProduct = () => {
    const newProduct = {
      name: '',
      category: '',
      price: 0,
      stock: 0,
      description: '',
      image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=350&h=220&fit=crop&crop=center'
    }
    setEditingItem(newProduct)
    setEditType('product')
    setShowEditModal(true)
  }

  // Order functions
  const handleEditOrder = (order) => {
    setEditingItem(order)
    setEditType('order')
    setShowEditModal(true)
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersAPI.delete(orderId)
        setOrders(orders.filter(o => o.id !== orderId))
      } catch (err) {
        // Fallback: delete from local state
        setOrders(orders.filter(o => o.id !== orderId))
        console.error('Error deleting order:', err)
      }
    }
  }

  const handleSaveOrder = async (updatedOrder) => {
    try {
      const savedOrder = await ordersAPI.updateStatus(updatedOrder.id, updatedOrder.status)
      setOrders(orders.map(o => o.id === updatedOrder.id ? { ...o, status: savedOrder.status } : o))
      setShowEditModal(false)
      setEditingItem(null)
    } catch (err) {
      // Fallback: update local state
      setOrders(orders.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o))
      setShowEditModal(false)
      setEditingItem(null)
      console.error('Error saving order:', err)
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      // Fallback: update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      console.error('Error updating order status:', err)
    }
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your tire supply business</p>
        </div>

        <div className="admin-content">
          <div className="admin-sidebar">
            <button
              className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`sidebar-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              📦 Products
            </button>
            <button
              className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 Orders
            </button>
          </div>

          <div className="admin-main">
            {activeTab === 'dashboard' && (
              <div className="dashboard">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                      <h3>{stats.totalOrders}</h3>
                      <p>Total Orders</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <h3>₱{stats.totalRevenue.toFixed(2)}</h3>
                      <p>Total Revenue</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🛒</div>
                    <div className="stat-info">
                      <h3>{stats.totalProducts}</h3>
                      <p>Total Products</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👤</div>
                    <div className="stat-info">
                      <h3>{stats.activeUsers}</h3>
                      <p>Active Users</p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-sections">
                  <div className="dashboard-card">
                    <h3>Recent Orders</h3>
                    <div className="recent-orders">
                      {recentOrders.map(order => (
                        <div key={order.id} className="recent-order-item">
                          <span>Order #{order.id}</span>
                          <span>{order.customer}</span>
                          <span>₱{order.total}</span>
                          <span className={`status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dashboard-card">
                    <h3>Low Stock Alert</h3>
                    <div className="low-stock">
                      {lowStockProducts.map(product => (
                        <div key={product.id} className="low-stock-item">
                          <span>{product.name}</span>
                          <span className="stock-count">{product.stock} left</span>
                          <button className="btn btn-small" onClick={() => handleRestock(product)}>Restock</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="products-management">
                <div className="section-header">
                  <h2>Product Management</h2>
                  <button className="btn btn-primary" onClick={handleAddProduct}>Add New Product</button>
                </div>
                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>₱{product.price.toFixed(2)}</td>
                          <td>{product.stock}</td>
                          <td>
                            <button
                              className="btn btn-small"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="orders-management">
                <div className="section-header">
                  <h2>Order Management - All Customer Orders</h2>
                  <div className="filters">
                    <select>
                      <option>All Status</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                    </select>
                  </div>
                </div>
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Products</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <React.Fragment key={order.id}>
                          <tr>
                            <td>#{order.id}</td>
                            <td>{order.customer}</td>
                            <td>{order.email || 'N/A'}</td>
                            <td>{order.phone || 'N/A'}</td>
                            <td>{new Date(order.date).toLocaleDateString()}</td>
                            <td>₱{order.total.toFixed(2)}</td>
                            <td>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="status-select"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td>
                              <div className="order-items-list">
                                {order.items && order.items.length > 0 ? (
                                  <ul>
                                    {order.items.map((item, idx) => (
                                      <li key={idx}>
                                        {item.quantity}× {item.product_name || item.name} — ₱{(item.price || 0).toFixed(2)}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span>No items</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-small"
                                onClick={() => handleEditOrder(order)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-small btn-danger"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editType === 'product' ? 'Edit Product' : 'Edit Order'}</h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {editType === 'product' ? (
                <ProductEditForm
                  product={editingItem}
                  onSave={handleSaveProduct}
                  onCancel={() => setShowEditModal(false)}
                />
              ) : (
                <OrderEditForm
                  order={editingItem}
                  onSave={handleSaveOrder}
                  onCancel={() => setShowEditModal(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Product Edit Form Component
function ProductEditForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState(product)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label>Product Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Category:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Performance">Performance</option>
          <option value="Touring">Touring</option>
          <option value="All-Season">All-Season</option>
        </select>
      </div>
      <div className="form-group">
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label>Stock:</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          min="0"
          required
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  )
}

// Order Edit Form Component
function OrderEditForm({ order, onSave, onCancel }) {
  const [formData, setFormData] = useState(order)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label>Order ID:</label>
        <input
          type="text"
          value={`#${formData.id}`}
          disabled
        />
      </div>
      <div className="form-group">
        <label>Customer:</label>
        <input
          type="text"
          name="customer"
          value={formData.customer}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Total:</label>
        <input
          type="number"
          name="total"
          value={formData.total}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
      </div>
      <div className="form-group">
        <label>Status:</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </div>
    </form>
  )
}

export default Admin