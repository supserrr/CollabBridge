/**
 * Firebase Authentication Hook
 * 
 * A comprehensive authentication system built on Firebase Auth with extended user management.
 * Provides authentication state management, sign-up/sign-in functionality, role-based access,
 * and integration with the backend user system.
 * 
 * Key Features:
 * - Firebase Authentication integration
 * - Email/password and Google OAuth sign-in
 * - Role-based user system (Event Planner vs Creative Professional)
 * - Username management and validation
 * - Real-time authentication state tracking
 * - Automatic token refresh and session management
 * - Backend API integration for user profiles
 * 
 * @hook
 * @example
 * ```tsx
 * const { user, loading, signIn, signUp, signOut } = useAuth();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (!user) return <SignInForm />;
 * return <AuthenticatedContent />;
 * ```
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

/**
 * User role types for role-based access control
 * Determines dashboard type and available features
 */
export type UserRole = 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL';

/**
 * Extended user interface with application-specific data
 * Combines Firebase user data with custom profile information
 */
export interface User {
  id: string;              // Unique user identifier
  email: string;           // User's email address
  name: string;            // Full display name
  username?: string;       // Unique username for URL routing
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL';  // User's role in the system
  isVerified: boolean;     // Email verification status
  avatar?: string;         // Profile picture URL
  bio?: string;           // User biography/description
  location?: string;      // User's location
  phone?: string;         // Contact phone number
  isActive: boolean;      // Account status
}

/**
 * Interface for user registration data
 * Contains all required information for account creation
 */
export interface SignUpData {
  email: string;           // Registration email
  password: string;        // Account password
  firstName: string;       // User's first name
  lastName: string;        // User's last name
  username?: string;       // Optional username (can be set later)
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL';  // Selected user role
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
  updateProfile: (data: { username?: string; role?: UserRole }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get the Firebase ID token
          const token = await firebaseUser.getIdToken();
          
          // Verify token with backend and get user data using Firebase token
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-firebase-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            
            // If we're on sign-in or sign-up pages and user has username, redirect
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname;
              if ((currentPath === '/signin' || currentPath === '/signup') && data.user.username) {
                window.location.href = `/${data.user.username}/dashboard`;
              }
            }
          } else {
            console.error('Failed to verify Firebase token with backend');
            setUser(null);
          }
        } catch (error) {
          console.error('Error verifying user with backend:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (data: SignUpData) => {
    try {
      setLoading(true);
      
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Register user with backend
      const registerUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`;
      console.log('🔍 Register URL:', registerUrl);
      console.log('🌍 Environment:', process.env.NODE_ENV);
      console.log('🔑 API_URL from env:', process.env.NEXT_PUBLIC_API_URL);
      
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('❌ NEXT_PUBLIC_API_URL is not set!');
        throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }
      
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          username: data.username,
          role: data.role,
          token,
        }),
      });

      if (!response.ok) {
        // If backend registration fails, delete the Firebase user
        await firebaseUser.delete();
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();
      setUser(result.user);
      
      // Redirect to username-based dashboard if we have a username
      if (result.user.username) {
        window.location.href = `/${result.user.username}/dashboard`;
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      setLoading(true);
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      // User state will be updated automatically by onAuthStateChanged
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      
      // Redirect to landing page after successful logout
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();
      
      // Check if user already exists in backend using Firebase token
      const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-firebase-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (checkResponse.ok) {
        // User already exists - sign them in
        const data = await checkResponse.json();
        setUser(data.user);
        
        // Redirect to their dashboard if they have a username
        if (data.user.username) {
          window.location.href = `/${data.user.username}/dashboard`;
        } else {
          // Existing user without username, send to onboarding
          window.location.href = '/onboarding';
        }
      } else {
        // New user - need to register
        const registerUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`;
        console.log('🔍 Register URL (in login):', registerUrl);
        
        const registerResponse = await fetch(registerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            role: 'CREATIVE_PROFESSIONAL', // Default role, user can change later
            token,
          }),
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.json();
          throw new Error(errorData.message || 'Registration failed');
        }

        const result = await registerResponse.json();
        // Set user without username to trigger onboarding flow
        setUser({ ...result.user, username: undefined });
        
        // Redirect to onboarding for new users
        window.location.href = '/onboarding';
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  };

  const updateProfile = async (data: { username?: string; role?: UserRole }): Promise<void> => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not authenticated');
      }

      const token = await firebaseUser.getIdToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      const result = await response.json();
      setUser(result.user);
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    checkUsernameAvailability,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

