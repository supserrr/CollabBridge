import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface LoadingErrorProps {
  error?: Error | string
  onRetry?: () => void
  message?: string
  className?: string
}

const LoadingError: React.FC<LoadingErrorProps> = ({
  error,
  onRetry,
  message = 'Failed to load data',
  className = ''
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || message

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
      </div>
      
      <h3 className="text-lg font-medium text-neutral-900 mb-2">
        {message}
      </h3>
      
      <p className="text-sm text-neutral-600 mb-4 max-w-sm">
        {errorMessage}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-primary btn-sm inline-flex items-center"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Retry
        </button>
      )}
    </div>
  )
}

export default LoadingError
