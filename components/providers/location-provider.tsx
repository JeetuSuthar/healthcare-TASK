'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { message } from 'antd'

interface Location {
  latitude: number
  longitude: number
  accuracy: number
}

interface LocationContextType {
  location: Location | null
  isWithinPerimeter: boolean
  loading: boolean
  refreshLocation: () => void
  perimeter: { latitude: number; longitude: number; radius: number } | null
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export { LocationContext }

// Cache for perimeter settings
let perimeterCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null)
  const [isWithinPerimeter, setIsWithinPerimeter] = useState(false)
  const [loading, setLoading] = useState(true)
  const [perimeter, setPerimeter] = useState<any>(null)

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }, [])

  const checkPerimeter = useCallback((currentLocation: Location) => {
    if (!perimeter || !currentLocation) {
      setIsWithinPerimeter(false)
      return
    }

    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      perimeter.latitude,
      perimeter.longitude
    )

    const withinPerimeter = distance <= perimeter.radius
    
    // Send location update to service worker for notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({
          type: 'LOCATION_UPDATE',
          location: currentLocation,
          perimeter: {
            latitude: perimeter.latitude,
            longitude: perimeter.longitude,
            radius: perimeter.radius
          },
          isWithinPerimeter: withinPerimeter,
          distance: Math.round(distance)
        })
      }).catch((error) => {
        console.error('Error sending location to service worker:', error)
      })
    }

    setIsWithinPerimeter(withinPerimeter)
  }, [perimeter, calculateDistance])

  // Debounced location update
  const debouncedLocationUpdate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (newLocation: Location) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          setLocation(newLocation)
          checkPerimeter(newLocation)
        }, 1000) // 1 second debounce
      }
    })(),
    [checkPerimeter]
  )

  const fetchPerimeterSettings = useCallback(async () => {
    try {
      // Check cache first
      const now = Date.now()
      if (perimeterCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setPerimeter(perimeterCache)
        return
      }

      const response = await fetch('/api/settings/perimeter', {
        headers: {
          'Cache-Control': 'max-age=300', // 5 minutes cache
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        perimeterCache = data
        cacheTimestamp = now
        setPerimeter(data)
      }
    } catch (error) {
      console.error('Error fetching perimeter:', error)
    }
  }, [])

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      message.error('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        setLocation(newLocation)
        checkPerimeter(newLocation)
        setLoading(false)
      },
      (error) => {
        console.error('Location error:', error)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    )
  }, [checkPerimeter])

  const refreshLocation = useCallback(() => {
    setLoading(true)
    getCurrentLocation()
  }, [getCurrentLocation])

  useEffect(() => {
    fetchPerimeterSettings()
    getCurrentLocation()
    
    // Set up location watching with debouncing
    const watchId = navigator.geolocation?.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        debouncedLocationUpdate(newLocation)
        setLoading(false)
      },
      (error) => {
        console.error('Location error:', error)
        message.error('Unable to get your location. Please enable location services.')
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute
      }
    )

    return () => {
      if (watchId) {
        navigator.geolocation?.clearWatch(watchId)
      }
    }
  }, [fetchPerimeterSettings, getCurrentLocation, debouncedLocationUpdate])

  const contextValue = useMemo(() => ({
    location,
    isWithinPerimeter,
    loading,
    refreshLocation,
    perimeter,
  }), [location, isWithinPerimeter, loading, refreshLocation, perimeter])

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
