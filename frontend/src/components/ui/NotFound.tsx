import React from 'react'
import Link from 'next/link'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Layout from '../layout/Layout'

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            {/* 404 Visual */}
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-neutral-300 mb-4">404</h1>
              <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-neutral-600 mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
            </p>
            
            <div className="space-y-4">
              <Link href="/" className="btn btn-primary w-full inline-flex items-center justify-center">
                <HomeIcon className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
              
              <button 
                onClick={() => window.history.back()}
                className="btn btn-outline w-full inline-flex items-center justify-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Go Back
              </button>
            </div>
            
            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 mb-4">Maybe try one of these pages:</p>
              <div className="space-y-2">
                <Link href="/browse/professionals" className="text-primary-600 hover:text-primary-500 text-sm block">
                  Browse Professionals
                </Link>
                <Link href="/browse/events" className="text-primary-600 hover:text-primary-500 text-sm block">
                  Browse Events
                </Link>
                <Link href="/help" className="text-primary-600 hover:text-primary-500 text-sm block">
                  Help Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default NotFound
