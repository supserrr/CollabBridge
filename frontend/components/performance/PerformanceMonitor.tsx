'use client'

import { useEffect } from 'react'

interface PerformanceMonitorProps {
  pageName: string
}

export function PerformanceMonitor({ pageName }: PerformanceMonitorProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Core Web Vitals monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric = entry.name
        const value = (entry as any).value || entry.duration || 0

        // Log performance metrics in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${pageName}] ${metric}:`, value, 'ms')
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
          (window as any).gtag('event', 'page_performance', {
            metric_name: metric,
            metric_value: value,
            page_name: pageName
          })
        }
      }
    })

    // Observe all performance entries
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })

    return () => observer.disconnect()
  }, [pageName])

  return null
}
