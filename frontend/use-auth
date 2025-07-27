"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  username?: string
  role: 'event_planner' | 'creative_professional'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

interface SignUpData {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  role: 'event_planner' | 'creative_professional'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        localStorage.removeItem('auth_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign in failed')
      }

      const data = await response.json()
      localStorage.setItem('auth_token', data.token)
      setUser(data.user)
      
      // Redirect based on role
      window.location.href = data.user.role === 'event_planner' 
        ? '/dashboard/planner' 
        : '/dashboard/professional'
    } catch (error) {
      throw error
    }
  }

  const signUp = async (signUpData: SignUpData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...signUpData,
          name: `${signUpData.firstName} ${signUpData.lastName}`
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Sign up failed')
      }

      const data = await response.json()
      localStorage.setItem('auth_token', data.token)
      setUser(data.user)
      
      // Redirect to onboarding
      window.location.href = '/onboarding'
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    window.location.href = '/'
  }

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Password reset failed')
      }
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

