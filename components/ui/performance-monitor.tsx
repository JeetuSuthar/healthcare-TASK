'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, Typography, Progress, Space, Tooltip } from 'antd'
import { 
  DashboardOutlined, 
  ClockCircleOutlined, 
  ThunderboltOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons'

const { Text, Title } = Typography

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  apiResponseTime: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    apiResponseTime: 0,
  })
  const [isVisible, setIsVisible] = useState(false)

  const measurePerformance = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
      
      // Memory usage (if available)
      const memory = (performance as any).memory
      const memoryUsage = memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 0
      
      setMetrics({
        loadTime,
        renderTime,
        memoryUsage,
        apiResponseTime: 0, // Will be updated by API calls
      })
    }
  }, [])

  const measureApiResponse = useCallback((startTime: number) => {
    const endTime = performance.now()
    const responseTime = endTime - startTime
    
    setMetrics(prev => ({
      ...prev,
      apiResponseTime: Math.max(prev.apiResponseTime, responseTime),
    }))
  }, [])

  useEffect(() => {
    // Measure initial performance
    measurePerformance()
    
    // Monitor for performance issues
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.duration > 1000) {
          console.warn('Slow performance detected:', entry)
        }
      }
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    // Show performance monitor in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }
    
    return () => observer.disconnect()
  }, [measurePerformance])

  // Expose API measurement function globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).measureApiResponse = measureApiResponse
    }
  }, [measureApiResponse])

  if (!isVisible) return null

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return '#52c41a' // Good
    if (value < threshold) return '#fa8c16' // Warning
    return '#ff4d4f' // Poor
  }

  const getPerformanceStatus = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'Good'
    if (value < threshold) return 'Warning'
    return 'Poor'
  }

  return (
    <Card 
      size="small" 
      className="fixed bottom-4 right-4 w-80 z-50 shadow-lg"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DashboardOutlined className="mr-2" />
            <Text strong>Performance</Text>
          </div>
          <Tooltip title="Performance metrics for debugging">
            <InfoCircleOutlined className="text-gray-400" />
          </Tooltip>
        </div>
      }
    >
      <Space direction="vertical" className="w-full" size="small">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Text type="secondary" className="text-xs">Load Time</Text>
            <Text className="text-xs">
              {metrics.loadTime.toFixed(0)}ms
            </Text>
          </div>
          <Progress 
            percent={Math.min((metrics.loadTime / 3000) * 100, 100)} 
            size="small"
            strokeColor={getPerformanceColor(metrics.loadTime, 3000)}
            showInfo={false}
          />
          <Text className="text-xs text-gray-500">
            Status: {getPerformanceStatus(metrics.loadTime, 3000)}
          </Text>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Text type="secondary" className="text-xs">Render Time</Text>
            <Text className="text-xs">
              {metrics.renderTime.toFixed(0)}ms
            </Text>
          </div>
          <Progress 
            percent={Math.min((metrics.renderTime / 1000) * 100, 100)} 
            size="small"
            strokeColor={getPerformanceColor(metrics.renderTime, 1000)}
            showInfo={false}
          />
          <Text className="text-xs text-gray-500">
            Status: {getPerformanceStatus(metrics.renderTime, 1000)}
          </Text>
        </div>

        {metrics.memoryUsage > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text type="secondary" className="text-xs">Memory Usage</Text>
              <Text className="text-xs">
                {metrics.memoryUsage.toFixed(1)}%
              </Text>
            </div>
            <Progress 
              percent={metrics.memoryUsage} 
              size="small"
              strokeColor={getPerformanceColor(metrics.memoryUsage, 80)}
              showInfo={false}
            />
            <Text className="text-xs text-gray-500">
              Status: {getPerformanceStatus(metrics.memoryUsage, 80)}
            </Text>
          </div>
        )}

        {metrics.apiResponseTime > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text type="secondary" className="text-xs">API Response</Text>
              <Text className="text-xs">
                {metrics.apiResponseTime.toFixed(0)}ms
              </Text>
            </div>
            <Progress 
              percent={Math.min((metrics.apiResponseTime / 2000) * 100, 100)} 
              size="small"
              strokeColor={getPerformanceColor(metrics.apiResponseTime, 2000)}
              showInfo={false}
            />
            <Text className="text-xs text-gray-500">
              Status: {getPerformanceStatus(metrics.apiResponseTime, 2000)}
            </Text>
          </div>
        )}

        <div className="text-center pt-2 border-t">
          <Text type="secondary" className="text-xs">
            Development Mode
          </Text>
        </div>
      </Space>
    </Card>
  )
}

// Hook to measure API performance
export function useApiPerformance() {
  const measureApiCall = useCallback((apiCall: () => Promise<any>) => {
    const startTime = performance.now()
    
    return apiCall().then((result: any) => {
      // Update global performance metrics
      if (typeof window !== 'undefined' && (window as any).measureApiResponse) {
        (window as any).measureApiResponse(startTime)
      }
      return result
    }).catch((error: any) => {
      // Still measure failed requests
      if (typeof window !== 'undefined' && (window as any).measureApiResponse) {
        (window as any).measureApiResponse(startTime)
      }
      throw error
    })
  }, [])

  return { measureApiCall }
}
