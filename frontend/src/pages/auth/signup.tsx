import React, { useState, useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../lib/auth/AuthContext'

interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL' | ''
  agreeToTerms: boolean
  subscribeNewsletter: boolean
}

const SignupPage: React.FC = () => {
  const router = useRouter()
  const { signup, signInWithGoogle } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeToTerms: false,
    subscribeNewsletter: false
  })

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Password strength validation
    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      })
    }
  }

  const handleRoleSelect = (role: 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL') => {
    setFormData(prev => ({ ...prev, role }))
  }

  const isStep1Valid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      Object.values(passwordStrength).every(Boolean)
    )
  }

  const isStep2Valid = () => {
    return formData.role !== '' && formData.agreeToTerms
  }

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2)
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isStep1Valid() || !isStep2Valid()) {
      setError('Please fill in all required fields correctly')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL'
      })
      
      // Redirect based on role
      if (formData.role === 'EVENT_PLANNER') {
        router.push('/dashboard?welcome=true&role=planner')
      } else {
        router.push('/dashboard?welcome=true&role=professional')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    if (currentStep === 1) {
      setError('Please complete Step 1 first, then select your role in Step 2')
      return
    }

    if (!formData.role) {
      setError('Please select your role before continuing with Google')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signInWithGoogle({
        role: formData.role as 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL'
      })
      
      // Redirect based on role
      if (formData.role === 'EVENT_PLANNER') {
        router.push('/dashboard?welcome=true&role=planner')
      } else {
        router.push('/dashboard?welcome=true&role=professional')
      }
    } catch (err: any) {
      setError(err.message || 'Google signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrengthScore = Object.values(passwordStrength).filter(Boolean).length
  const strengthColor = passwordStrengthScore < 3 ? 'bg-red-500' : passwordStrengthScore < 5 ? 'bg-yellow-500' : 'bg-green-500'
  const strengthText = passwordStrengthScore < 3 ? 'Weak' : passwordStrengthScore < 5 ? 'Good' : 'Strong'

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">CollabBridge</span>
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Join CollabBridge and start connecting with amazing professionals
            </p>
          </div>

          <div className="mt-8">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= 1 ? 'bg-primary-600 border-primary-600 text-white' : 'border-neutral-300 text-neutral-500'
                }`}>
                  {currentStep > 1 ? <CheckIcon className="w-5 h-5" /> : '1'}
                </div>
                <div className={`flex-1 h-1 mx-2 ${currentStep > 1 ? 'bg-primary-600' : 'bg-neutral-300'}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= 2 ? 'bg-primary-600 border-primary-600 text-white' : 'border-neutral-300 text-neutral-500'
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-neutral-600">
                <span>Account Details</span>
                <span>Choose Your Role</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700">
                        First name *
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="input-field mt-1"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700">
                        Last name *
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="input-field mt-1"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                      Email address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field mt-1"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                      Password *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="input-field pr-10"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-neutral-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
                              style={{ width: `${(passwordStrengthScore / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-neutral-600">{strengthText}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 text-xs">
                          {Object.entries({
                            'At least 8 characters': passwordStrength.length,
                            'One uppercase letter': passwordStrength.uppercase,
                            'One lowercase letter': passwordStrength.lowercase,
                            'One number': passwordStrength.number,
                            'One special character': passwordStrength.special
                          }).map(([rule, satisfied]) => (
                            <div key={rule} className="flex items-center space-x-1">
                              {satisfied ? (
                                <CheckIcon className="w-3 h-3 text-green-500" />
                              ) : (
                                <XMarkIcon className="w-3 h-3 text-neutral-400" />
                              )}
                              <span className={satisfied ? 'text-green-600' : 'text-neutral-500'}>
                                {rule}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                      Confirm password *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="input-field pr-10"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-neutral-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!isStep1Valid()}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-neutral-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-lg shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue to role selection
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-4">
                      What describes you best?
                    </h3>
                    <div className="space-y-3">
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.role === 'EVENT_PLANNER'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                        onClick={() => handleRoleSelect('EVENT_PLANNER')}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="EVENT_PLANNER"
                            checked={formData.role === 'EVENT_PLANNER'}
                            onChange={() => handleRoleSelect('EVENT_PLANNER')}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                          />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-neutral-900">Event Planner</h4>
                            <p className="text-sm text-neutral-600">
                              I organize events and need to hire creative professionals
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.role === 'CREATIVE_PROFESSIONAL'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                        onClick={() => handleRoleSelect('CREATIVE_PROFESSIONAL')}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="role"
                            value="CREATIVE_PROFESSIONAL"
                            checked={formData.role === 'CREATIVE_PROFESSIONAL'}
                            onChange={() => handleRoleSelect('CREATIVE_PROFESSIONAL')}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                          />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-neutral-900">Creative Professional</h4>
                            <p className="text-sm text-neutral-600">
                              I provide creative services and want to find event opportunities
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="text-neutral-700">
                          I agree to the{' '}
                          <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                            Privacy Policy
                          </Link>
                          *
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="subscribeNewsletter"
                          name="subscribeNewsletter"
                          type="checkbox"
                          checked={formData.subscribeNewsletter}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="text-neutral-700">
                          I'd like to receive updates and marketing communications
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!isStep2Valid() || loading}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-neutral-500">Or</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={!formData.role || loading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-lg shadow-sm bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-3"></div>
                    ) : (
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    {loading ? 'Signing up...' : 'Sign up with Google'}
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6">
              <p className="text-center text-sm text-neutral-600">
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Welcome to CollabBridge</h2>
            <p className="text-xl opacity-90 mb-8">
              Connect with amazing creative professionals and event planners
            </p>
            <div className="grid grid-cols-1 gap-6 max-w-md">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <span>Find the perfect professionals for your events</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <span>Showcase your creative services</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <span>Build lasting professional relationships</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
