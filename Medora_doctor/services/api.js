import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://ai-project-j1x5.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to inject the secure token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Silent catch to prevent leaking secure credentials/tokens
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors (like unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if unauthorized (token expired or invalid)
    if (error.response && error.response.status === 401) {
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (e) {}
      
      // Global callback for App.js/AuthContext to trigger logout redirect
      if (api.onUnauthorized) {
        api.onUnauthorized();
      }
    }
    
    // Normalize error matching backend schema
    const errorData = error.response?.data || {};
    const errorMessage = errorData.error || 'A network error occurred. Please check your connection.';
    const errorAction = errorData.action || 'Please try again.';
    
    const normalizedError = {
      message: errorMessage,
      action: errorAction,
      status: error.response?.status,
    };
    
    return Promise.reject(normalizedError);
  }
);

export default api;
