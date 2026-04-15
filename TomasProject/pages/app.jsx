import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navigation from './Navigation'
import Home from './Home'
import Products from './Products'
import Orders from './Orders'
import Admin from './Admin'
import Login from './Login'
import Register from './Register'
import './App.css'

// Auth Context
export const AuthContext = React.createContext()

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ login, logout }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={user.role === 'admin' ? <Admin /> : <Home />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  )
}

export default App 