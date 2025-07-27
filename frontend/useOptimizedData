'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseOptimizedDataOptions<T> {
  fetchFn: () => Promise<T>
  deps?: unknown[]
  enabled?: boolean
  staleTime?: number
  cacheKey?: string
}

// Simple in-memory cache
const dataCache = new Map<string, { data: unknown; timestamp: number }>()

export function useOptimizedData<T>({
  fetchFn,
  deps = [],
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheKey
}: UseOptimizedDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)

      // Check cache first
      if (cacheKey) {
        const cached = dataCache.get(cacheKey)
        if (cached && Date.now() - cached.timestamp < staleTime) {
          setData(cached.data as T)
          setLoading(false)
          return
        }
      }

      const result = await fetchFn()
      
      // Cache the result
      if (cacheKey) {
        dataCache.set(cacheKey, { data: result, timestamp: Date.now() })
      }
      
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [fetchFn, enabled, staleTime, cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...deps])

  const refetch = useCallback(() => {
    if (cacheKey) {
      dataCache.delete(cacheKey)
    }
    fetchData()
  }, [fetchData, cacheKey])

  return { data, loading, error, refetch }
}

// Batch multiple API calls
export function useBatchData<T extends Record<string, unknown>>(
  requests: Record<keyof T, () => Promise<T[keyof T]>>,
  enabled = true
) {
  const [data, setData] = useState<Partial<T>>({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, Error>>({})

  useEffect(() => {
    if (!enabled) return

    const fetchBatch = async () => {
      setLoading(true)
      const results: Partial<T> = {}
      const requestErrors: Record<string, Error> = {}

      // Execute all requests in parallel
      await Promise.allSettled(
        Object.entries(requests).map(async ([key, request]) => {
          try {
            const result = await request()
            results[key as keyof T] = result
          } catch (error) {
            requestErrors[key] = error instanceof Error ? error : new Error('Unknown error')
          }
        })
      )

      setData(results)
      setErrors(requestErrors)
      setLoading(false)
    }

    fetchBatch()
  }, [enabled])

  return { data, loading, errors }
}

// Optimized image loading
export function useOptimizedImage(src: string, placeholder?: string) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.onload = () => setLoaded(true)
    img.onerror = () => setError(true)
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return {
    src: loaded ? src : placeholder,
    loaded,
    error
  }
}

