import api, { handleApiResponse, handleApiError } from '../lib/api';
import type { User, LoginForm, RegisterForm, ApiResponse } from '../types';
import Cookies from 'js-cookie';
import { toast } from '../components/ui/Toast';

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      const authData = handleApiResponse(response);
      
      // Store token in cookies
      const expiresIn = credentials.rememberMe ? 30 : 1; // 30 days or 1 day
      Cookies.set('auth_token', authData.token, { expires: expiresIn });
      
      return authData;
    } catch (error: any) {
      // Handle network/connection errors gracefully
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        toast.error('Backend server is not available', 'Please start the backend server or try again later.');
        throw new Error('Backend server is not available. Please try again later.');
      }
      throw new Error(handleApiError(error));
    }
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
      const authData = handleApiResponse(response);
      
      // Store token in cookies
      Cookies.set('auth_token', authData.token, { expires: 1 });
      
      return authData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('auth_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return handleApiResponse(response);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await api.post<ApiResponse<boolean>>('/auth/verify-token', { token });
      return handleApiResponse(response);
    } catch (error) {
      return false;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post<ApiResponse>('/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.post<ApiResponse>('/auth/reset-password', { token, password });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async resendVerification(): Promise<void> {
    try {
      await api.post<ApiResponse>('/auth/resend-verification');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  isAuthenticated(): boolean {
    return !!Cookies.get('auth_token');
  }

  getToken(): string | undefined {
    return Cookies.get('auth_token');
  }
}

export default new AuthService();
