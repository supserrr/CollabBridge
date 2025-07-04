// frontend/src/config/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Check for new token in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    }
    
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          console.error('Resource not found:', data.message);
          break;
        case 500:
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    profile: '/auth/profile',
    logout: '/auth/logout',
    verifyToken: '/auth/verify-token',
    deleteAccount: '/auth/account'
  },
  
  // User endpoints
  users: {
    professionals: '/users/professionals',
    search: '/users/professionals/search',
    topRated: '/users/professionals/top-rated',
    byLocation: (location) => `/users/professionals/location/${location}`,
    stats: '/users/stats',
    dashboard: '/users/dashboard',
    byId: (id) => `/users/${id}`,
    updateProfile: (id) => `/users/${id}`,
    availability: '/users/availability'
  },
  
  // Event endpoints
  events: {
    list: '/events',
    create: '/events',
    myEvents: '/events/my-events',
    search: '/events/search',
    stats: '/events/stats',
    byType: (type) => `/events/type/${type}`,
    byId: (id) => `/events/${id}`,
    update: (id) => `/events/${id}`,
    delete: (id) => `/events/${id}`
  },
  
  // Application endpoints
  applications: {
    create: '/applications',
    myApplications: '/applications/my-applications',
    byEvent: (eventId) => `/applications/event/${eventId}`,
    byId: (id) => `/applications/${id}`,
    updateStatus: (id) => `/applications/${id}/status`,
    withdraw: (id) => `/applications/${id}`,
    stats: '/applications/stats',
    bulkUpdate: '/applications/bulk-update'
  },
  
  // Review endpoints
  reviews: {
    create: '/reviews',
    myReviews: '/reviews/my-reviews',
    pending: '/reviews/pending',
    stats: '/reviews/stats',
    byUser: (userId) => `/reviews/user/${userId}`,
    byApplication: (appId) => `/reviews/application/${appId}`,
    byId: (id) => `/reviews/${id}`,
    update: (id) => `/reviews/${id}`,
    delete: (id) => `/reviews/${id}`
  }
};

// Helper functions for common API calls
export const apiHelpers = {
  // Get with error handling
  get: async (endpoint, config = {}) => {
    try {
      const response = await api.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Post with error handling
  post: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await api.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Put with error handling
  put: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await api.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  // Delete with error handling
  delete: async (endpoint, config = {}) => {
    try {
      const response = await api.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default api;