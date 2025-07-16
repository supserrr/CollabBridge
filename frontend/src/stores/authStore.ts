import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, firebaseUid: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  name: string;
  role: string;
  firebaseUid: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, firebaseUid: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/auth/login', {
            email,
            firebaseUid,
          });
          
          const { token, user } = response.data;
          
          set({ 
            user,
            token,
            isLoading: false,
            error: null,
          });
          
          // Store in localStorage for persistence
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/auth/register', userData);
          
          const { token, user } = response.data;
          
          set({ 
            user,
            token,
            isLoading: false,
            error: null,
          });
          
          // Store in localStorage for persistence
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null,
          token: null,
          error: null,
        });
        
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...userData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
