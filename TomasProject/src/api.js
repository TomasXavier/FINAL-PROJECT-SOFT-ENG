export const API_BASE_URL = window.location.port === '5173'
  ? 'http://localhost:3001/api'
  : '/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Products API
export const productsAPI = {
  getAll: () => fetch(`${API_BASE_URL}/products`).then(res => {
    if (!res.ok) throw new Error(res.status === 503 ? 'Database not connected' : 'Failed to fetch products');
    return res.json();
  }),
  getById: (id) => fetch(`${API_BASE_URL}/products/${id}`).then(res => {
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  }),
  create: (product) => fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(product)
  }).then(res => {
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  }),
  update: (id, product) => fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(product)
  }).then(res => {
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  }),
  delete: (id) => fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(res => {
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  })
};

// Orders API
export const ordersAPI = {
  getAll: () => fetch(`${API_BASE_URL}/orders`, {
    headers: getAuthHeaders()
  }).then(res => {
    if (!res.ok) throw new Error(res.status === 503 ? 'Database not connected' : 'Failed to fetch orders');
    return res.json();
  }),
  getById: (id) => fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: getAuthHeaders()
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  }),
  create: (order) => fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(order)
  }).then(res => {
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  }),
  updateStatus: (id, status) => fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ status })
  }).then(res => {
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  }),
  update: (id, order) => fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(order)
  }).then(res => {
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  }),
  delete: (id) => fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  }).then(res => {
    if (!res.ok) throw new Error('Failed to delete order');
    return res.json();
  })
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: getAuthHeaders()
  }).then(res => {
    if (!res.ok) throw new Error(res.status === 503 ? 'Database not connected' : 'Failed to fetch dashboard stats');
    return res.json();
  })
};

// Users API
export const usersAPI = {
  getAll: () => fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders()
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  })
};
