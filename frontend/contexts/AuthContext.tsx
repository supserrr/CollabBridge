'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { apiHelpers } from '@/lib/api';

interface CollabBridgeUser {
  id: string;
  name: string;
  email: string;
  role: 'planner' | 'professional';
  bio?: string;
  phone?: string;
  location?: string;
  rating?: number;
  availability_status?: 'available' | 'busy' | 'unavailable';
  created_at: string;
}

interface AuthContextType {
  user: CollabBridgeUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CollabBridgeUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await apiHelpers.get('/auth/profile');
      setUser(userData.user);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      await apiHelpers.post('/auth/logout');
      setUser(null);
      setFirebaseUser(null);
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Check if we have a stored auth token
          const token = localStorage.getItem('authToken');
          
          if (token) {
            // Try to get user data from our API
            await refreshUser();
          } else {
            // If no token, user might need to complete registration
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    firebaseUser,
    loading,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}