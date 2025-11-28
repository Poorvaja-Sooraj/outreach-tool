import axios from 'axios';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: BASE });
export default api;
