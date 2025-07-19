'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { authAPI } from '@/lib/api'
import { User, CreativeCategory } from '@/types'
import { AuthContextType, SignupData } from '@/types/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize Google Auth Provider
  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user profile from backend
          const token = await firebaseUser.getIdToken()
          localStorage.setItem('authToken', token)
          
          const response = await authAPI.getProfile()
          setUser(response.data)
        } catch (error) {
          console.error('Error fetching user profile:', error)
          setUser(null)
        }
      } else {
        setUser(null)
        localStorage.removeItem('authToken')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem('authToken', token)
      
      const response = await authAPI.getProfile()
      setUser(response.data)
      
      toast.success('Welcome back!')
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, userData: SignupData) => {
    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem('authToken', token)
      
      // Create user profile in backend
      const response = await authAPI.signup({
        email,
        ...userData,
        firebaseUid: userCredential.user.uid,
      })
      
      setUser(response.data.user)
      toast.success('Account created successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Signup failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      await authAPI.logout()
      setUser(null)
      localStorage.removeItem('authToken')
      toast.success('Logged out successfully')
    } catch (error: any) {
      toast.error('Logout failed')
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authAPI.updateProfile(data)
      setUser(response.data)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error('Failed to update profile')
      throw error
    }
  }

  const signInWithGoogle = async (userData?: { role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL'; category?: CreativeCategory }) => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      // Check if user already exists in our system
      try {
        const userCheck = await authAPI.checkUser(user.uid)
        
        if (userCheck.data.exists) {
          // User exists, just sign them in
          const response = await authAPI.googleSignIn({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
          })
          
          const { token, user: userData } = response.data
          setUser(userData)
          localStorage.setItem('authToken', token)
          toast.success('Signed in successfully!')
        } else {
          // New user, create account with provided data
          if (!userData) {
            // User doesn't exist and no role data provided - redirect to signup
            await auth.signOut()
            throw new Error('REDIRECT_TO_SIGNUP')
          }
          
          const response = await authAPI.googleSignup({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: userData.role,
            ...(userData.category && { category: userData.category }),
          })
          
          const { token, user: newUserData } = response.data
          setUser(newUserData)
          localStorage.setItem('authToken', token)
          toast.success('Account created successfully!')
        }
      } catch (checkError: any) {
        if (checkError.response?.status === 404) {
          // User doesn't exist, handle as new user
          if (!userData) {
            await auth.signOut()
            throw new Error('REDIRECT_TO_SIGNUP')
          }
          
          const response = await authAPI.googleSignup({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: userData.role,
            ...(userData.category && { category: userData.category }),
          })
          
          const { token, user: newUserData } = response.data
          setUser(newUserData)
          localStorage.setItem('authToken', token)
          toast.success('Account created successfully!')
        } else {
          throw checkError
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      if (error.message === 'REDIRECT_TO_SIGNUP') {
        throw error
      }
      throw new Error(error.response?.data?.message || 'Google sign-in failed')
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    signInWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
