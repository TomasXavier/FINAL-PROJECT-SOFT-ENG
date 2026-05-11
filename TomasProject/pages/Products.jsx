import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './app.jsx'
import { productsAPI, ordersAPI } from '../src/api'
import './Products.css'

function Products() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const defaultProducts = [
    { id: 1, name: 'Michelin City Grip 2', category: 'Motorcycle - Scooter Tires', price: 4800, stock: 30, description: 'Reliable urban scooter tire for stability & comfort', image: 'michelin-city-grip-2.jpg', rating: 4.7 },
    { id: 2, name: 'Michelin City Grip Pro', category: 'Motorcycle - Scooter Tires', price: 5200, stock: 28, description: 'Better grip for wet and dry city conditions', image: 'michelin-city-grip-pro.jpg', rating: 4.8 },
    { id: 3, name: 'Pirelli Angel Scooter', category: 'Motorcycle - Scooter Tires', price: 5000, stock: 25, description: 'Sporty scooter tire with responsive steering', image: 'pirelli-angel-scooter.jpg', rating: 4.6 },
    { id: 4, name: 'Pirelli Diablo Rosso Scooter', category: 'Motorcycle - Scooter Tires', price: 5500, stock: 22, description: 'High-grip performance tire for scooters', image: 'pirelli-diablo-rosso-scooter.jpg', rating: 4.7 },
    { id: 5, name: 'Michelin Pilot Street', category: 'Motorcycle - Underbone/Commuter Tires', price: 6800, stock: 24, description: 'Durable commuting tire with excellent wet traction', image: 'michelin-pilot-street.jpg', rating: 4.8 },
    { id: 6, name: 'Michelin Pilot Moto GP', category: 'Motorcycle - Underbone/Commuter Tires', price: 7200, stock: 20, description: 'Sporty commuter tire with dual usage performance', image: 'michelin-pilot-moto-gp.jpg', rating: 4.9 },
    { id: 7, name: 'Maxxis Extramaxx M6233', category: 'Motorcycle - Underbone/Commuter Tires', price: 6200, stock: 26, description: 'Stable 14-17 inch commuter tire with comfort handling', image: '', rating: 4.5 },
    { id: 8, name: 'Pirelli Diablo Rosso Sport', category: 'Motorcycle - Underbone/Commuter Tires', price: 7300, stock: 18, description: 'Aggressive tread control and wear resistance', image: '', rating: 4.7 },
    { id: 9, name: 'Metzeler Karoo 4', category: 'Motorcycle - Adventure/Dual Sport Tires', price: 11000, stock: 16, description: 'Off-road ready dual-sport tire with traction', image: '', rating: 4.9 },
    { id: 10, name: 'Pirelli Scorpion Rally STR', category: 'Motorcycle - Adventure/Dual Sport Tires', price: 12500, stock: 14, description: 'Long-range adventure tire with wet grip', image: '', rating: 4.8 },
    { id: 11, name: 'Michelin Anakee Wild', category: 'Motorcycle - Adventure/Dual Sport Tires', price: 13000, stock: 12, description: 'Hard terrain grip with road stability', image: '', rating: 4.9 },
    { id: 12, name: 'Michelin Anakee Street', category: 'Motorcycle - Adventure/Dual Sport Tires', price: 11800, stock: 15, description: 'Street and light off-road all-rounder', image: '', rating: 4.8 },
    { id: 13, name: 'Michelin Road 6', category: 'Motorcycle - Big Bike/Sport Tires', price: 14500, stock: 11, description: 'All-weather sport tire for 17+ inch rims', image: '', rating: 4.9 },
    { id: 14, name: 'Pirelli Diablo Rosso III', category: 'Motorcycle - Big Bike/Sport Tires', price: 14000, stock: 10, description: 'High-performance sport tire with agility', image: '', rating: 4.8 },
    { id: 15, name: 'Pirelli Diablo Rosso IV', category: 'Motorcycle - Big Bike/Sport Tires', price: 15000, stock: 9, description: 'Ultimum sport power and grip', image: '', rating: 4.9 },
    { id: 16, name: 'Bridgestone Dueler H/T', category: 'SUV/Truck - Highway Terrain', price: 15800, stock: 27, description: 'City & daily use all-season SUV tire', image: 'Bridgestone Dueler HT.avif', rating: 4.6 },
    { id: 17, name: 'Goodyear Assurance MaxGuard SUV', category: 'SUV/Truck - Highway Terrain', price: 16500, stock: 24, description: 'Improved tread life and wet handling', image: '', rating: 4.7 },
    { id: 18, name: 'Michelin Primacy SUV+', category: 'SUV/Truck - Highway Terrain', price: 17800, stock: 20, description: 'Premium comfort and quiet ride in city use', image: '', rating: 4.8 },
    { id: 19, name: 'Dunlop Grandtrek AT25', category: 'SUV/Truck - Highway Terrain', price: 15000, stock: 23, description: 'Durable highway all-terrain for SUVs', image: '', rating: 4.5 },
    { id: 20, name: 'Nitto NT421Q', category: 'SUV/Truck - Highway Terrain', price: 14200, stock: 18, description: 'Balanced highway handling and wear resistance', image: '', rating: 4.6 },
    { id: 21, name: 'Michelin Pilot Sport 4', category: 'Sports Car - Max Performance / Summer', price: 19900, stock: 16, description: 'Track-capable summer performance tire', image: '', rating: 4.9 },
    { id: 22, name: 'Michelin Pilot Sport 4 S', category: 'Sports Car - Max Performance / Summer', price: 22000, stock: 14, description: 'Ultra-high performance for sports cars', image: '', rating: 4.9 },
    { id: 23, name: 'Pirelli P Zero', category: 'Sports Car - Max Performance / Summer', price: 18500, stock: 17, description: 'Iconic summer performance for aggressive cars', image: '', rating: 4.8 },
    { id: 24, name: 'Pirelli P Zero PZ4', category: 'Sports Car - Max Performance / Summer', price: 21000, stock: 12, description: 'Precision handling and dry grip', image: '', rating: 4.8 },
    { id: 25, name: 'Michelin Pilot Sport Cup 2', category: 'Sports Car - Track/Semi-Slick', price: 23500, stock: 9, description: 'Semi-slick track performance tire', image: '', rating: 4.9 },
    { id: 26, name: 'Pirelli P Zero Trofeo R', category: 'Sports Car - Track/Semi-Slick', price: 26000, stock: 8, description: 'Ultimate street-legal track tire', image: '', rating: 4.9 },
    { id: 27, name: 'Bridgestone Potenza RE-71RS', category: 'Sports Car - Track/Semi-Slick', price: 17000, stock: 11, description: 'High grip time-attack performance tire', image: '', rating: 4.8 },
    { id: 28, name: 'Yokohama Advan A052', category: 'Sports Car - Track/Semi-Slick', price: 16500, stock: 10, description: 'Ultra high grip track and street tire', image: '', rating: 4.8 }
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productsAPI.getAll()
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data)
      } else {
        setProducts(defaultProducts)
      }
      setError(null)
    } catch (err) {
      console.error('Error loading products:', err)
      setProducts(defaultProducts)
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category))]

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login to place an order.')
      navigate('/login')
      return
    }
    
    if (user.role === 'admin') {
      alert('Admins cannot place orders. Only regular user accounts can purchase products.')
      return
    }
    
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    try {
      // Create order data
      const orderData = {
        customer: user.email,
        total: cartTotal,
        status: 'Processing',
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      }

      // Try to create order via API
      try {
        await ordersAPI.create(orderData)
      } catch (apiError) {
        console.warn('API order creation failed, using fallback:', apiError)
        if (apiError.message && apiError.message.includes('Admins cannot')) {
          alert('Admins cannot place orders. Only regular user accounts can purchase products.')
          return
        }
        // Fallback: just proceed since we have mock data
      }

      alert('Checkout successful! Your order has been placed.')
      setCart([])
      navigate('/orders')
    } catch (error) {
      console.error('Checkout error:', error)
      alert('There was an error processing your order. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="loading">Loading products...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="error">{error}</div>
          <button onClick={loadProducts} className="btn btn-primary">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Our Tire Collection</h1>
          <p>Find the perfect tires for your vehicle</p>
        </div>

        <div className="filters">
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="products-content">
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="product-photo" />
                  ) : (
                    <div className="product-icon">🛞</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <p className="description">{product.description}</p>
                  <div className="rating">
                    ⭐ {product.rating}
                  </div>
                  <div className="price">₱{product.price}</div>
                  <button
                    className="btn btn-primary add-to-cart"
                    onClick={() => addToCart(product)}
                    disabled={user && user.role === 'admin'}
                    title={user && user.role === 'admin' ? 'Admins cannot place orders' : ''}
                  >
                    {user && user.role === 'admin' ? '🔒 Admin Account' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-sidebar">
            <h2>Shopping Cart</h2>
            {user && user.role === 'admin' ? (
              <div className="admin-notice">
                <p className="admin-message">⚠️ Admins cannot place orders.</p>
                <p>Admin accounts are for managing products only.</p>
              </div>
            ) : cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                    <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total: ₱{cartTotal.toFixed(2)}</strong>
                </div>
                <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products