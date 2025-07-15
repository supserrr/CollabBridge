import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get Firebase token if user is authenticated
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Generic API functions
export const apiGet = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const apiPost = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  try {
    const response = await api.post(url, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const apiPut = async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const apiDelete = async <T>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// File upload function
export const uploadFile = async (file: File, folder: string = 'general'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  try {
    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data.url;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Error handler
const handleApiError = (error: any): Error => {
  if (error.response?.data?.error) {
    return new Error(error.response.data.error);
  } else if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  } else if (error.message) {
    return new Error(error.message);
  } else {
    return new Error('An unexpected error occurred');
  }
};

export default api;
