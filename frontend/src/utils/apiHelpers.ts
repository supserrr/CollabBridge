import api from './api';
import type { AxiosResponse } from 'axios';

// Generic API response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API helper functions
export const apiGet = async <T = any>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.get(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An error occurred',
    };
  }
};

export const apiPost = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.post(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An error occurred',
    };
  }
};

export const apiPut = async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.put(url, data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An error occurred',
    };
  }
};

export const apiDelete = async <T = any>(url: string): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await api.delete(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An error occurred',
    };
  }
};

export default api;
