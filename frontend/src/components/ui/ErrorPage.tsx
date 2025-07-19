import React from 'react'
import Link from 'next/link'
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline'
import Layout from '../layout/Layout'

interface ErrorPageProps {
  statusCode?: number
  title?: string
  message?: string
  showRetry?: boolean
  onRetry?: () => void
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title = 'Something went wrong',
  message = 'We apologize for the inconvenience. Please try again later.',
  showRetry = true,
  onRetry
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Status Code */}
            {statusCode && (
              <div className="mb-4">
                <span className="text-6xl font-bold text-neutral-300">{statusCode}</span>
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              {title}
            </h1>
            <p className="text-neutral-600 mb-8">
              {message}
            </p>
            
            <div className="space-y-4">
              {showRetry && (
                <button 
                  onClick={handleRetry}
                  className="btn btn-primary w-full inline-flex items-center justify-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}
              
              <Link href="/" className="btn btn-outline w-full inline-flex items-center justify-center">
                <HomeIcon className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </div>
            
            {/* Support */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 mb-2">
                Still having trouble?
              </p>
              <Link href="/contact" className="text-primary-600 hover:text-primary-500 text-sm">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ErrorPage
