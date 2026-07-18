import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add auto logout on token expiration
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    // We don't force redirect immediately to let store handle state
  }
  return Promise.reject(error);
});
