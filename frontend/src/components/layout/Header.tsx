'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">CollabBridge</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href={user.role === 'EVENT_PLANNER' ? '/browse/professionals' : '/browse/events'} 
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Browse
                </Link>
                <Link 
                  href="/messages" 
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Messages
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/browse/professionals" 
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Find Professionals
                </Link>
                <Link 
                  href="/browse/events" 
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Find Events
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8" />
                  )}
                  <span className="font-medium">{user.firstName}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                    <Link 
                      href="/profile"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/settings"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <hr className="border-neutral-200 my-1" />
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        handleLogout()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Links */
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/signin"
                  className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/signup"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="text-neutral-600 hover:text-neutral-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href={user.role === 'EVENT_PLANNER' ? '/browse/professionals' : '/browse/events'}
                    className="text-neutral-600 hover:text-neutral-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse
                  </Link>
                  <Link 
                    href="/messages"
                    className="text-neutral-600 hover:text-neutral-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link 
                    href="/profile"
                    className="text-neutral-600 hover:text-neutral-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="text-left text-neutral-600 hover:text-neutral-900 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/browse/professionals"
                    className="text-neutral-600 hover:text-neutral-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Find Professionals
                  </Link>
                  <Link 
                    href="/browse/events"
                    className="text-neutral-600 hover:text-neutral-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Find Events
                  </Link>
                  <Link 
                    href="/auth/signin"
                    className="text-neutral-600 hover:text-neutral-900 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="btn-primary inline-block text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
