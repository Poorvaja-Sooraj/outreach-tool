// frontend/src/api/client.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: BASE, timeout: 10000 });

// helper to set/remove Authorization header
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// When the page loads, if there's a token in localStorage, set the header
if (typeof window !== 'undefined') {
  const t = localStorage.getItem('token');
  if (t) setAuthToken(t);
}

export default api;
