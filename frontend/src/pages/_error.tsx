import React from 'react'
import { NextPageContext } from 'next'
import ErrorPage from '@/components/ui/ErrorPage'

interface CustomErrorProps {
  statusCode?: number
  hasGetInitialPropsRun?: boolean
  err?: Error
}

function CustomError({ statusCode, hasGetInitialPropsRun, err }: CustomErrorProps) {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps was not called during server-side rendering
    // This is likely a client-side error
    console.error('Client-side error:', err)
  }

  const getErrorMessage = (code?: number) => {
    switch (code) {
      case 404:
        return 'The page you are looking for could not be found.'
      case 500:
        return 'An internal server error occurred. Please try again later.'
      case 503:
        return 'The service is temporarily unavailable. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again later.'
    }
  }

  const getErrorTitle = (code?: number) => {
    switch (code) {
      case 404:
        return 'Page Not Found'
      case 500:
        return 'Internal Server Error'
      case 503:
        return 'Service Unavailable'
      default:
        return 'Something Went Wrong'
    }
  }

  return (
    <ErrorPage
      statusCode={statusCode}
      title={getErrorTitle(statusCode)}
      message={getErrorMessage(statusCode)}
      showRetry={statusCode !== 404}
    />
  )
}

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404
  return { statusCode, hasGetInitialPropsRun: true }
}

export default CustomError
