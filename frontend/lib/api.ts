import axios, { AxiosResponse } from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://collabbridge.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check for new token in response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('authToken', newToken);
    }
    
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      const { status, data } = response;
      
      // Handle different error scenarios
      switch (status) {
        case 401:
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          // Redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          console.error('🚫 Access Forbidden:', data.message);
          break;
          
        case 404:
          console.error('🔍 Not Found:', data.message);
          break;
          
        case 429:
          console.error('⏱️ Rate Limited:', data.message);
          break;
          
        case 500:
          console.error('🔥 Server Error:', data.message);
          break;
          
        default:
          console.error('❌ API Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      console.error('🌐 Network Error - No response received');
    } else {
      console.error('⚙️ Request Setup Error:', error.message);
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
    deleteAccount: '/auth/account',
  },
  
  // User endpoints
  users: {
    professionals: '/users/professionals',
    search: '/users/professionals/search',
    topRated: '/users/professionals/top-rated',
    byLocation: (location: string) => `/users/professionals/location/${encodeURIComponent(location)}`,
    stats: '/users/stats',
    dashboard: '/users/dashboard',
    byId: (id: string) => `/users/${id}`,
    updateProfile: (id: string) => `/users/${id}`,
    availability: '/users/availability',
  },
  
  // Event endpoints
  events: {
    list: '/events',
    create: '/events',
    myEvents: '/events/my-events',
    search: '/events/search',
    stats: '/events/stats',
    byType: (type: string) => `/events/type/${type}`,
    byId: (id: string) => `/events/${id}`,
    update: (id: string) => `/events/${id}`,
    delete: (id: string) => `/events/${id}`,
  },
  
  // Application endpoints
  applications: {
    create: '/applications',
    myApplications: '/applications/my-applications',
    byEvent: (eventId: string) => `/applications/event/${eventId}`,
    byId: (id: string) => `/applications/${id}`,
    updateStatus: (id: string) => `/applications/${id}/status`,
    withdraw: (id: string) => `/applications/${id}`,
    stats: '/applications/stats',
    bulkUpdate: '/applications/bulk-update',
  },
  
  // Review endpoints
  reviews: {
    create: '/reviews',
    myReviews: '/reviews/my-reviews',
    pending: '/reviews/pending',
    stats: '/reviews/stats',
    byUser: (userId: string) => `/reviews/user/${userId}`,
    byApplication: (appId: string) => `/reviews/application/${appId}`,
    byId: (id: string) => `/reviews/${id}`,
    update: (id: string) => `/reviews/${id}`,
    delete: (id: string) => `/reviews/${id}`,
  },
};

// Helper functions for common API calls
export const apiHelpers = {
  // GET request with error handling
  get: async <T = any>(endpoint: string, config = {}): Promise<T> => {
    try {
      const response = await api.get(endpoint, config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message || 'An error occurred';
    }
  },
  
  // POST request with error handling
  post: async <T = any>(endpoint: string, data = {}, config = {}): Promise<T> => {
    try {
      const response = await api.post(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message || 'An error occurred';
    }
  },
  
  // PUT request with error handling
  put: async <T = any>(endpoint: string, data = {}, config = {}): Promise<T> => {
    try {
      const response = await api.put(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message || 'An error occurred';
    }
  },
  
  // DELETE request with error handling
  delete: async <T = any>(endpoint: string, config = {}): Promise<T> => {
    try {
      const response = await api.delete(endpoint, config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message || 'An error occurred';
    }
  },
  
  // PATCH request with error handling
  patch: async <T = any>(endpoint: string, data = {}, config = {}): Promise<T> => {
    try {
      const response = await api.patch(endpoint, data, config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message || 'An error occurred';
    }
  },
};

export default api;