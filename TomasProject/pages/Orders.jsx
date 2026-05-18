import { useState, useEffect, useContext } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { ordersAPI } from '../src/api'
import { AuthContext } from './app.jsx'
import './Orders.css'

function Orders() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersAPI.getAll()
      setOrders(data)
      setError(null)
    } catch (err) {
      console.error('Error loading orders:', err)
      // Fallback to mock data
      setOrders([
        {
          id: 1,
          date: '2024-03-15',
          status: 'Delivered',
          total: 12500,
          items: [
            { name: 'Michelin Pilot Sport 4S', quantity: 1, price: 12500 }
          ]
        },
        {
          id: 2,
          date: '2024-03-20',
          status: 'Shipped',
          total: 8900,
          items: [
            { name: 'Bridgestone Turanza T005', quantity: 1, price: 8900 }
          ]
        },
        {
          id: 3,
          date: '2024-03-25',
          status: 'Processing',
          total: 15200,
          items: [
            { name: 'Pirelli P Zero', quantity: 1, price: 15200 }
          ]
        }
      ])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#10b981'
      case 'Shipped': return '#f59e0b'
      case 'Processing': return '#3b82f6'
      default: return '#64748b'
    }
  }

  const handleReorder = (order) => {
    const reorderItems = order.items.map(item => ({
      id: item.product_id || item.id,
      name: item.product_name || item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }))

    localStorage.setItem('reorderCart', JSON.stringify(reorderItems))
    navigate('/products')
  }

  const handleTrackOrder = (order) => {
    const trackingInfo = {
      'Processing': 'Your order is being prepared for shipment.',
      'Shipped': 'Your order has been shipped and is on its way.',
      'Delivered': 'Your order has been delivered successfully.'
    }
    alert(`Order #${order.id} - ${order.status}\n\n${trackingInfo[order.status] || 'Tracking information not available.'}`)
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading">Loading orders...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="error">{error}</div>
          <button onClick={loadOrders} className="btn btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your tire orders</p>
        </div>

        <div className="orders-content">
          <div className="orders-list">
            {orders.map(order => (
              <div
                key={order.id}
                className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">{order.date}</p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="order-summary">
                  <p className="item-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  <p className="order-total">₱{order.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="order-details">
            {selectedOrder ? (
              <div className="order-detail-card">
                <h2>Order Details #{selectedOrder.id}</h2>
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <p><strong>Date:</strong> {selectedOrder.date}</p>
                  <p><strong>Status:</strong>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p><strong>Total:</strong> ₱{selectedOrder.total.toFixed(2)}</p>
                </div>

                <div className="detail-section">
                  <h3>Items</h3>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  <button className="btn btn-outline" onClick={() => handleReorder(selectedOrder)}>Reorder</button>
                  <button className="btn btn-primary" onClick={() => handleTrackOrder(selectedOrder)}>Track Order</button>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">📦</div>
                <h3>Select an order to view details</h3>
                <p>Click on any order from the list to see more information</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
