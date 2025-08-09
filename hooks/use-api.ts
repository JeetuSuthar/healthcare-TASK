import { useState, useCallback, useRef } from 'react'
import { message } from 'antd'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  showError?: boolean
  showSuccess?: boolean
  successMessage?: string
  errorMessage?: string
}

interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    onSuccess,
    onError,
    showError = true,
    showSuccess = false,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      // Cancel previous request if it's still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      const result = await apiFunction(...args, abortControllerRef.current.signal)
      
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      if (showSuccess) {
        message.success(successMessage)
      }
      
      return result
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name === 'AbortError') {
        return null
      }

      const errorMsg = err.message || errorMessage
      setError(errorMsg)
      
      if (onError) {
        onError(errorMsg)
      }
      
      if (showError) {
        message.error(errorMsg)
      }
      
      return null
    } finally {
      setLoading(false)
    }
  }, [apiFunction, onSuccess, onError, showError, showSuccess, successMessage, errorMessage])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

// Cached API call hook
export function useCachedApi<T = any>(
  key: string,
  apiFunction: () => Promise<T>,
  options: UseApiOptions & { cacheDuration?: number } = {}
): UseApiReturn<T> {
  const { cacheDuration = CACHE_DURATION, ...apiOptions } = options

  const cachedApiFunction = useCallback(async () => {
    const now = Date.now()
    const cached = cache.get(key)
    
    if (cached && (now - cached.timestamp) < cacheDuration) {
      return cached.data
    }

    const data = await apiFunction()
    cache.set(key, { data, timestamp: now })
    return data
  }, [key, apiFunction, cacheDuration])

  return useApi(cachedApiFunction, apiOptions)
}

// Utility functions for common API patterns
export const apiUtils = {
  get: async (url: string, signal?: AbortSignal) => {
    const response = await fetch(url, { signal })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  post: async (url: string, data: any, signal?: AbortSignal) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  put: async (url: string, data: any, signal?: AbortSignal) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  delete: async (url: string, signal?: AbortSignal) => {
    const response = await fetch(url, {
      method: 'DELETE',
      signal,
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  clearCache: (key?: string) => {
    if (key) {
      cache.delete(key)
    } else {
      cache.clear()
    }
  }
}
