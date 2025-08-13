'use client'

import { useEffect, useState } from 'react'
import { message } from 'antd'

interface LocationNotificationProps {
  isWithinPerimeter: boolean
  location: { latitude: number; longitude: number } | null
  perimeter: { latitude: number; longitude: number; radius: number } | null
}

export function useLocationNotifications({ isWithinPerimeter, location, perimeter }: LocationNotificationProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [previousPerimeterState, setPreviousPerimeterState] = useState<boolean | null>(null)

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
      
      if (Notification.permission === 'default') {
        // Register service worker and request permission
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.active?.postMessage({ type: 'REQUEST_PERMISSION' })
          })
        }
      }
    }
  }, [])

  // Monitor perimeter state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && previousPerimeterState !== null && previousPerimeterState !== isWithinPerimeter) {
      // State changed - trigger notification via service worker
      if ('serviceWorker' in navigator && location && perimeter) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({
            type: 'LOCATION_UPDATE',
            location,
            perimeter
          })
        })
      }
    }
    
    setPreviousPerimeterState(isWithinPerimeter)
  }, [isWithinPerimeter, location, perimeter, previousPerimeterState])

  // Show in-app notification as fallback
  useEffect(() => {
    if (previousPerimeterState !== null && previousPerimeterState !== isWithinPerimeter) {
      if (isWithinPerimeter) {
        message.success({
          content: '📍 You\'re now in the work area! Ready to clock in?',
          duration: 5,
          style: { marginTop: '20vh' }
        })
      } else {
        message.warning({
          content: '📍 You\'ve left the work area. Don\'t forget to clock out!',
          duration: 5,
          style: { marginTop: '20vh' }
        })
      }
    }
  }, [isWithinPerimeter, previousPerimeterState])

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        message.success('Location notifications enabled!')
      } else {
        message.warning('Location notifications disabled. You\'ll see in-app alerts instead.')
      }
    }
  }

  return {
    notificationPermission,
    requestPermission,
    isSupported: typeof window !== 'undefined' && 'Notification' in window
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        message.success('ShiftTracker installed successfully!')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-liefGreen-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📱</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">Install ShiftTracker</h3>
          <p className="text-xs text-gray-500 mt-1">
            Add to your home screen for quick access and offline support
          </p>
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="text-xs bg-liefGreen-500 text-white px-3 py-1.5 rounded hover:bg-liefGreen-600 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="text-xs text-gray-500 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PWAManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('SW registration failed:', error)
        })
    }

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true)
      message.success('You\'re back online! Data will sync automatically.')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      message.warning('You\'re offline. The app will continue to work with cached data.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Set initial state
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleUpdate = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      })
    }
  }

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-40">
          📱 Offline Mode - Data will sync when reconnected
        </div>
      )}

      {/* Update available prompt */}
      {updateAvailable && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-blue-500 text-white rounded-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Update Available</h3>
              <p className="text-sm opacity-90">New version ready to install</p>
            </div>
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}

      <PWAInstallPrompt />
    </>
  )
}
