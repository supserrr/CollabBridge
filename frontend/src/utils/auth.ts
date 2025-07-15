import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { User, UserRole } from '@/types';
import { apiPost, apiGet } from './api';

// Initialize auth
export const auth = getAuth();

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    // Verify token with backend and get user data
    const response = await apiPost<User>('/auth/verify-token', { token });
    
    if (!response.success || !response.data) {
      throw new Error('Failed to authenticate user');
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Sign in failed');
  }
};

// Register new user
export const signUp = async (
  email: string, 
  password: string, 
  name: string, 
  role: UserRole,
  additionalData?: any
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    // Register user with backend
    const response = await apiPost<User>('/auth/register', {
      token,
      name,
      role,
      ...additionalData
    });
    
    if (!response.success || !response.data) {
      throw new Error('Failed to create user account');
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || 'Sign up failed');
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    // Clear any local storage
    localStorage.removeItem('user');
  } catch (error: any) {
    throw new Error(error.message || 'Sign out failed');
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      unsubscribe();
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const response = await apiPost<User>('/auth/verify-token', { token });
          
          if (response.success && response.data) {
            resolve(response.data);
          } else {
            resolve(null);
          }
        } catch (error) {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Check if user is authenticated (for Astro server-side)
export const getUser = async (request: Request): Promise<User | null> => {
  try {
    // This would be implemented based on your session management
    // For now, return null for server-side rendering
    return null;
  } catch (error) {
    return null;
  }
};

// Password validation
export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
