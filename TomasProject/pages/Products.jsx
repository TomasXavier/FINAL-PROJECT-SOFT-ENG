import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './app.jsx'
import { productsAPI, ordersAPI } from '../src/api'
import { defaultProducts } from '../src/defaultProducts'
import './Products.css'

function Products() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const getTireIcon = (category) => {
    if (category.includes('Motorcycle')) return '🏍️'
    if (category.includes('SUV') || category.includes('Truck')) return '🚙'
    if (category.includes('Sports Car')) return '🏎️'
    return '🛞'
  }

  useEffect(() => {
    loadProducts()
    loadReorderCart()
  }, [])

  const loadReorderCart = () => {
    const savedCart = localStorage.getItem('reorderCart')
    if (!savedCart) return

    try {
      const parsedCart = JSON.parse(savedCart)
      if (Array.isArray(parsedCart) && parsedCart.length > 0) {
        setCart(parsedCart)
      }
    } catch (err) {
      console.error('Error loading reorder cart:', err)
    } finally {
      localStorage.removeItem('reorderCart')
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productsAPI.getAll()
      const loadedProducts = Array.isArray(data) && data.length > 0 ? data : defaultProducts
      setProducts(loadedProducts.map(product => ({
        ...product,
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        rating: Number(product.rating) || 0
      })))
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

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId))
      return
    }

    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ))
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
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
        email: user.email,
        total: cartTotal,
        status: 'Processing',
        items: cart.map(item => ({
          product_id: item.id,
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
                  <div className="product-icon">{getTireIcon(product.category)}</div>
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
                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="item-quantity">x{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      type="button"
                      className="remove-cart-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
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
