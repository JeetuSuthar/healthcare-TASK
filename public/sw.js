const CACHE_NAME = 'healthcare-shifttracker-v2'
const STATIC_CACHE = 'static-v2'
const DYNAMIC_CACHE = 'dynamic-v2'

const STATIC_ASSETS = [
  '/',
  '/worker/dashboard',
  '/manager/dashboard',
  '/auth/login',
  '/manifest.json',
  '/placeholder-logo.png',
  '/placeholder-logo.svg',
  '/_next/static/css/app.css',
  '/offline.html'
]

const API_ENDPOINTS = [
  '/api/auth/me',
  '/api/shifts/active',
  '/api/shifts/history',
  '/api/manager/stats'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Removing old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('[SW] Claiming clients')
      return self.clients.claim()
    })
  )
})

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline fallback for critical API endpoints
            if (API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint))) {
              return new Response(JSON.stringify({ 
                offline: true, 
                message: 'You are offline. Some data may be outdated.' 
              }), {
                headers: { 'Content-Type': 'application/json' }
              })
            }
          })
        })
    )
    return
  }

  // Handle page requests with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background
          fetch(request).then((response) => {
            if (response.status === 200) {
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, response.clone())
              })
            }
          }).catch(() => {})
          return cachedResponse
        }

        // Fetch from network and cache
        return fetch(request)
          .then((response) => {
            if (response.status === 200 && url.origin === location.origin) {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html')
            }
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'clock-action-sync') {
    event.waitUntil(syncClockActions())
  }
})

async function syncClockActions() {
  try {
    // Get pending clock actions from IndexedDB
    const pendingActions = await getPendingClockActions()
    
    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        })
        
        if (response.ok) {
          await removePendingClockAction(action.id)
          console.log('[SW] Synced clock action:', action.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync action:', action.id, error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Geolocation notifications for perimeter entry/exit
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'LOCATION_UPDATE') {
    handleLocationUpdate(event.data.location, event.data.perimeter)
  }
  
  if (event.data && event.data.type === 'REQUEST_PERMISSION') {
    requestNotificationPermission()
  }
})

async function handleLocationUpdate(location, perimeter) {
  if (!location || !perimeter) return
  
  const distance = calculateDistance(
    location.latitude, location.longitude,
    perimeter.latitude, perimeter.longitude
  )
  
  const isInside = distance <= perimeter.radius
  
  // Get previous state from storage
  const prevState = await getStoredPerimeterState()
  
  if (prevState !== null && prevState !== isInside) {
    // State changed - show notification
    if (isInside) {
      showPerimeterNotification(
        'Clock In Available',
        'You\'re now within the work area. Would you like to clock in?',
        'clockin'
      )
    } else {
      showPerimeterNotification(
        'Clock Out Reminder',
        'You\'ve left the work area. Don\'t forget to clock out!',
        'clockout'
      )
    }
  }
  
  // Store current state
  await storePerimeterState(isInside)
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c // Distance in kilometers
}

async function showPerimeterNotification(title, body, action) {
  if (Notification.permission !== 'granted') return
  
  const options = {
    body,
    icon: '/placeholder-logo.png',
    badge: '/placeholder-logo.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { action },
    actions: [
      {
        action: action,
        title: action === 'clockin' ? 'Clock In' : 'Clock Out',
        icon: '/placeholder-logo.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/placeholder-logo.png'
      }
    ],
    tag: 'perimeter-' + action
  }

  await self.registration.showNotification(title, options)
}

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const { action } = event.notification.data || {}
  
  if (action === 'clockin' || action === 'clockout') {
    event.waitUntil(
      clients.openWindow(`/worker/dashboard?action=${action}`)
    )
  } else if (event.action === 'clockin' || event.action === 'clockout') {
    event.waitUntil(
      clients.openWindow(`/worker/dashboard?action=${event.action}`)
    )
  } else if (event.action !== 'dismiss') {
    event.waitUntil(
      clients.openWindow('/worker/dashboard')
    )
  }
})

// Helper functions for IndexedDB operations
async function getPendingClockActions() {
  // Simplified - in real implementation, use IndexedDB
  return []
}

async function removePendingClockAction(id) {
  // Simplified - in real implementation, use IndexedDB
  console.log('Removing pending action:', id)
}

async function getStoredPerimeterState() {
  try {
    const stored = await caches.match('perimeter-state')
    if (stored) {
      const data = await stored.json()
      return data.isInside
    }
  } catch (error) {
    console.error('Error getting perimeter state:', error)
  }
  return null
}

async function storePerimeterState(isInside) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const response = new Response(JSON.stringify({ isInside, timestamp: Date.now() }))
    await cache.put('perimeter-state', response)
  } catch (error) {
    console.error('Error storing perimeter state:', error)
  }
}

async function requestNotificationPermission() {
  if ('Notification' in self && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}
