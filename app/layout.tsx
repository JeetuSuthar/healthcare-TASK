import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import { AuthProvider } from '@/components/providers/auth-provider'
import { LocationProvider } from '@/components/providers/location-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'
import { PWAManager } from '@/components/pwa-manager'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'ShiftTracker - Healthcare Worker Management',
  description: 'Track healthcare worker shifts with location-based clock in/out',
  manifest: '/manifest.json',
  generator: 'v0.dev',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShiftTracker',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/placeholder-logo.png',
    apple: '/placeholder-logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00BFA5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#00BFA5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ShiftTracker" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#00BFA5" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#1890ff',
                  borderRadius: 8,
                  fontFamily: inter.style.fontFamily,
                },
                components: {
                  Card: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  },
                  Button: {
                    borderRadius: 8,
                    fontWeight: 500,
                  },
                  Input: {
                    borderRadius: 8,
                  },
                  Select: {
                    borderRadius: 8,
                  },
                },
              }}
            >
              <AuthProvider>
                <LocationProvider>
                  {children}
                  <PWAManager />
                </LocationProvider>
              </AuthProvider>
            </ConfigProvider>
          </AntdRegistry>
        </ErrorBoundary>
      </body>
    </html>
  )
}
