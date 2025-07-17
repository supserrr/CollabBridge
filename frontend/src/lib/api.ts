import axios from 'axios';
import { auth } from './firebase';
import { ENV, API_CONFIG } from '@/config';

const API_BASE_URL = ENV.API_URL;

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
