import { User } from '@/types';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUser();
};

export const hasRole = (requiredRole: string): boolean => {
  const user = getCurrentUser();
  return user?.role === requiredRole;
};

export const getUser = async (request: Request): Promise<User | null> => {
  // Server-side auth check for Astro pages
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  try {
    // You would validate the token here with your backend
    // For now, return null as this is handled client-side
    return null;
  } catch {
    return null;
  }
};
