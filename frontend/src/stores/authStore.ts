import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { apiPost } from '@/utils/apiHelpers';
import socketService from '@/utils/socket';

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
          const response = await apiPost('/auth/login', {
            email,
            firebaseUid,
          });
          
          if (response.success && response.data) {
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
            
            // Connect to socket with token
            socketService.connect(token);
          } else {
            throw new Error(response.error || 'Login failed');
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiPost('/auth/register', userData);
          
          if (response.success && response.data) {
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
            
            // Connect to socket with token
            socketService.connect(token);
          } else {
            throw new Error(response.error || 'Registration failed');
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed',
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
        
        // Disconnect socket
        socketService.disconnect();
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
