import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ShiftTracker - Healthcare Worker Management',
    short_name: 'ShiftTracker',
    description: 'Track healthcare worker shifts with location-based clock in/out',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1890ff',
    orientation: 'portrait',
    icons: [
      {
        src: '/placeholder-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/placeholder-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['healthcare', 'productivity', 'business'],
    screenshots: [
      {
        src: '/placeholder.jpg',
        sizes: '390x844',
        type: 'image/png',
      },
      {
        src: '/placeholder.jpg',
        sizes: '1920x1080',
        type: 'image/png',
      },
    ],
  }
}
