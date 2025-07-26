'use client'

import { memo, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { OptimizedMotion } from '@/components/performance/DynamicLoader'

interface OptimizedLayoutProps {
  children: React.ReactNode
  className?: string
  enableAnimations?: boolean
  showLoadingState?: boolean
}

// Memoized layout to prevent unnecessary re-renders
export const OptimizedLayout = memo(function OptimizedLayout({
  children,
  className,
  enableAnimations = true,
  showLoadingState = true
}: OptimizedLayoutProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(showLoadingState)

  useEffect(() => {
    setIsClient(true)
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [])

  // Show minimal loading state during hydration
  if (!isClient || isLoading) {
    return (
      <div className={cn("min-h-screen bg-background", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <OptimizedMotion 
      className={cn("min-h-screen bg-background", className)}
      disabled={!enableAnimations}
      duration={0.2}
    >
      {children}
    </OptimizedMotion>
  )
})

// Optimized page wrapper with performance monitoring
interface OptimizedPageProps {
  children: React.ReactNode
  className?: string
  pageName?: string
}

export const OptimizedPage = memo(function OptimizedPage({
  children,
  className,
  pageName
}: OptimizedPageProps) {
  useEffect(() => {
    // Performance monitoring
    if (pageName && typeof window !== 'undefined') {
      const startTime = performance.now()
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            console.log(`${pageName} load time:`, navEntry.loadEventEnd - navEntry.loadEventStart, 'ms')
          }
        }
      })
      
      observer.observe({ entryTypes: ['navigation'] })
      
      return () => observer.disconnect()
    }
  }, [pageName])

  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  )
})

// Optimized section component with intersection observer
interface OptimizedSectionProps {
  children: React.ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}

export const OptimizedSection = memo(function OptimizedSection({
  children,
  className,
  threshold = 0.1,
  rootMargin = '50px'
}: OptimizedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(ref)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold, rootMargin])

  return (
    <div ref={setRef} className={className}>
      {isVisible ? children : <div className="h-64" />}
    </div>
  )
})
