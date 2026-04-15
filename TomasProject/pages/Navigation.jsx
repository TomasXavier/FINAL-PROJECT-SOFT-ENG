import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './app.jsx'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useContext(AuthContext)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🚗 TireSupply Pro
        </Link>

        <div className="nav-menu">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
          >
            Products
          </Link>
          <Link
            to="/orders"
            className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
          >
            Orders
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              Admin
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-info">Welcome, {user.email}</span>
              <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation