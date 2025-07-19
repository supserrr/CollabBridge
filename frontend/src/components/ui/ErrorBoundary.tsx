import React from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <DefaultErrorFallback 
          error={this.state.error} 
          resetError={this.resetError} 
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-neutral-600 mb-6">
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          {error && (
            <details className="text-left bg-neutral-100 p-4 rounded-lg mb-6 text-sm">
              <summary className="cursor-pointer font-medium text-neutral-700 mb-2">
                Error details
              </summary>
              <pre className="text-red-600 whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>
          )}
          <div className="space-y-3">
            <button onClick={resetError} className="w-full btn btn-primary">
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Try again
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full btn btn-outline"
            >
              Go to homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
export { DefaultErrorFallback }
