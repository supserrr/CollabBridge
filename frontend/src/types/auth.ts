import { User, CreativeCategory } from './index'

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, userData: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  signInWithGoogle: (userData?: { role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL'; category?: CreativeCategory }) => Promise<void>
}

export interface SignupData {
  firstName: string
  lastName: string
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL'
  category?: CreativeCategory
  company?: string
  bio?: string
  location?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  firstName: string
  lastName: string
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL'
  category?: CreativeCategory
  company?: string
}
