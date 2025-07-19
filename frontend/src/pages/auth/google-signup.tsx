'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth/AuthContext'
import Layout from '@/components/layout/Layout'
import { CreativeCategory } from '@/types'

const GoogleSignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    role: 'EVENT_PLANNER' as 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL',
    category: '' as CreativeCategory | '',
    company: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signInWithGoogle, user } = useAuth()
  const router = useRouter()

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const creativeCategories: { value: CreativeCategory; label: string }[] = [
    { value: 'PHOTOGRAPHER', label: 'Photographer' },
    { value: 'VIDEOGRAPHER', label: 'Videographer' },
    { value: 'DJ', label: 'DJ' },
    { value: 'MUSICIAN', label: 'Musician' },
    { value: 'CATERER', label: 'Caterer' },
    { value: 'DECORATOR', label: 'Decorator' },
    { value: 'FLORIST', label: 'Florist' },
    { value: 'MC', label: 'MC/Host' },
    { value: 'LIGHTING_TECHNICIAN', label: 'Lighting Technician' },
    { value: 'SOUND_TECHNICIAN', label: 'Sound Technician' },
    { value: 'MAKEUP_ARTIST', label: 'Makeup Artist' },
    { value: 'OTHER', label: 'Other' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGoogleSignUp = async () => {
    if (formData.role === 'CREATIVE_PROFESSIONAL' && !formData.category) {
      setError('Please select a category')
      return
    }

    setError('')
    setLoading(true)

    try {
      const userData = {
        role: formData.role,
        ...(formData.role === 'CREATIVE_PROFESSIONAL' && { category: formData.category as CreativeCategory }),
      }
      await signInWithGoogle(userData)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Google sign-up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CB</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
              Complete your profile
            </h2>
            <p className="mt-2 text-center text-sm text-neutral-600">
              Tell us a bit about yourself to continue with Google
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <input
                    type="radio"
                    name="role"
                    value="EVENT_PLANNER"
                    checked={formData.role === 'EVENT_PLANNER'}
                    onChange={handleChange}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-neutral-900">Event Planner</div>
                    <div className="text-sm text-neutral-500">I organize events and need creative professionals</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <input
                    type="radio"
                    name="role"
                    value="CREATIVE_PROFESSIONAL"
                    checked={formData.role === 'CREATIVE_PROFESSIONAL'}
                    onChange={handleChange}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-neutral-900">Creative Professional</div>
                    <div className="text-sm text-neutral-500">I provide creative services for events</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Category (for Creative Professionals) */}
            {formData.role === 'CREATIVE_PROFESSIONAL' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="input mt-1"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select your category</option>
                  {creativeCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Company (for Event Planners) */}
            {formData.role === 'EVENT_PLANNER' && (
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-neutral-700">
                  Company (optional)
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="input mt-1"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                />
              </div>
            )}

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700">
                Location (optional)
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="input mt-1"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Google Sign Up Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading || (formData.role === 'CREATIVE_PROFESSIONAL' && !formData.category)}
                className="w-full flex justify-center items-center px-4 py-3 bg-primary-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <Link href="/auth/signin" className="text-sm text-primary-600 hover:text-primary-500">
                ← Back to sign in
              </Link>
            </div>

            <div className="text-xs text-neutral-500 text-center">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default GoogleSignupPage
