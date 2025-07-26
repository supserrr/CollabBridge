'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface DynamicLoaderProps {
  importFn: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  className?: string
}

export function DynamicLoader({ 
  importFn, 
  fallback = <PageSkeleton />, 
  className 
}: DynamicLoaderProps) {
  const DynamicComponent = lazy(importFn)

  return (
    <Suspense fallback={fallback}>
      <div className={className}>
        <DynamicComponent />
      </div>
    </Suspense>
  )
}

// Optimized loading skeletons
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

// Optimized motion component wrapper
interface OptimizedMotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  disabled?: boolean
}

export function OptimizedMotion({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.3,
  disabled = false 
}: OptimizedMotionProps) {
  // Only load framer-motion if animations are needed
  if (disabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return <div className={className}>{children}</div>
  }

  // Lazy load framer-motion only when needed
  const MotionDiv = lazy(() => 
    import('framer-motion').then(mod => ({ 
      default: mod.motion.div 
    }))
  )

  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay }}
        className={className}
      >
        {children}
      </MotionDiv>
    </Suspense>
  )
}
