import axios, { type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import type { ApiResponse } from '../types';

// Get API base URL from environment
const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and logging
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear auth token and redirect to login
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      console.warn('Access forbidden - insufficient permissions');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error - please try again later');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Export the base URL for use in other parts of the application
export const API_BASE_URL = `${import.meta.env.PUBLIC_API_URL || 'http://localhost:3000'}/api`;

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  throw new Error(response.data.error || response.data.message || 'API request failed');
};

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Helper function to check if we're in development mode
export const isDevelopment = () => import.meta.env.DEV;

// Helper function to get auth token
export const getAuthToken = () => Cookies.get('auth_token');

// Helper function to set auth token
export const setAuthToken = (token: string) => {
  Cookies.set('auth_token', token, { 
    expires: 7, // 7 days
    secure: !import.meta.env.DEV, // Only secure in production
    sameSite: 'strict'
  });
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  Cookies.remove('auth_token');
};
