'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Layout, Card, Button, Typography, Space, message, Modal, Input, Tag, Spin, Row, Col, Statistic } from 'antd'
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  LogoutOutlined, 
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useAuth } from '@/hooks/use-auth'
import { useLocation } from '@/hooks/use-location'
import { WorkerLayout } from '@/components/layouts/worker-layout'
import { LocationStatus } from '@/components/location-status'
import { ShiftHistory } from '@/components/shift-history'
import { Loading, ActionLoading } from '@/components/ui/loading'
import { flushSync } from 'react-dom'

const { Title, Text } = Typography
const { TextArea } = Input

export default function WorkerDashboard() {
  const { user } = useAuth()
  const { location, isWithinPerimeter, loading: locationLoading } = useLocation()
  const [currentShift, setCurrentShift] = useState<any>(null)
  const [noteModalVisible, setNoteModalVisible] = useState(false)
  const [note, setNote] = useState('')
  const [actionType, setActionType] = useState<'clockin' | 'clockout'>('clockin')
  const [loading, setLoading] = useState(false)
  const [shiftLoading, setShiftLoading] = useState(true)

  // Force re-render when currentShift changes - this helps with responsive layout issues
  const forceRenderKey = useMemo(() => {
    return `${currentShift?.id || 'no-shift'}-${loading}-${actionType}`
  }, [currentShift, loading, actionType])

  const checkActiveShift = useCallback(async () => {
    try {
      setShiftLoading(true)
      
      const response = await fetch('/api/shifts/active', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const shift = await response.json()
        
        // Use flushSync to force immediate state update (this fixes DevTools issue)
        flushSync(() => {
          setCurrentShift(shift)
        })
        
        // Force a small delay to ensure state has updated
        await new Promise(resolve => setTimeout(resolve, 50))
        
      } else {
        flushSync(() => {
          setCurrentShift(null)
        })
      }
    } catch (error) {
      console.error('Error checking active shift:', error)
      flushSync(() => {
        setCurrentShift(null)
      })
      message.error('Failed to check active shift')
    } finally {
      // Ensure loading state is updated after shift state
      setTimeout(() => {
        setShiftLoading(false)
      }, 10)
    }
  }, [])

  // Remove the window event listeners that were causing issues
  useEffect(() => {
    checkActiveShift()
  }, [checkActiveShift])

  const handleClockAction = useCallback((type: 'clockin' | 'clockout') => {
    if (type === 'clockin' && !isWithinPerimeter) {
      message.error('You must be within the designated area to clock in!')
      return
    }
    
    setActionType(type)
    setNoteModalVisible(true)
  }, [isWithinPerimeter])

  const confirmClockAction = useCallback(async () => {
    if (!location) {
      message.error('Unable to get your location. Please try again.')
      return
    }

    setLoading(true)
    
    try {
      // If trying to clock in but there's already an active shift, reset first
      if (actionType === 'clockin' && currentShift) {
        const resetResponse = await fetch('/api/shifts/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (resetResponse.ok) {
          const resetResult = await resetResponse.json()
          if (resetResult.success) {
            message.info('Previous shift was automatically closed.')
          }
        }
      }
      
      const endpoint = actionType === 'clockin' ? '/api/shifts/clockin' : '/api/shifts/clockout'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          note: note.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Close modal BEFORE updating state to prevent race conditions
        flushSync(() => {
          setNoteModalVisible(false)
          setNote('')
          setLoading(false)
        })
        
        // Show success message
        message.success(`Successfully clocked ${actionType === 'clockin' ? 'in' : 'out'}!`)
        
        // Wait a moment then refresh state
        await new Promise(resolve => setTimeout(resolve, 100))
        await checkActiveShift()
        
        return // Exit early after successful action
        
      } else {
        // Handle error cases
        if (actionType === 'clockin' && result.message?.includes('already have an active shift')) {
          // Show a modal asking if they want to clock out first
          Modal.confirm({
            title: 'Active Shift Detected',
            icon: <ExclamationCircleOutlined />,
            content: 'You already have an active shift. Would you like to clock out of that shift first and then start a new one?',
            onOk: async () => {
              try {
                // Reset the active shift
                const resetResponse = await fetch('/api/shifts/reset', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                })
                
                if (resetResponse.ok) {
                  message.info('Previous shift closed. You can now clock in again.')
                  // Refresh state and close modal
                  flushSync(() => {
                    setNoteModalVisible(false)
                    setNote('')
                  })
                  await checkActiveShift()
                } else {
                  throw new Error('Failed to reset shift')
                }
              } catch (e) {
                console.error('Failed to reset shift:', e)
                message.error('Failed to reset your active shift.')
              }
            },
          })
        } else {
          message.error(result.message || 'Action failed')
        }
      }
    } catch (error) {
      console.error('Clock action error:', error)
      message.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [actionType, location, note, checkActiveShift, currentShift])

  const closeModal = useCallback(() => {
    setNoteModalVisible(false)
    setNote('')
  }, [])

  const currentShiftDuration = useMemo(() => {
    if (!currentShift?.clockInTime) return null
    
    const startTime = new Date(currentShift.clockInTime)
    const now = new Date()
    const duration = now.getTime() - startTime.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    return { hours, minutes }
  }, [currentShift])

  // Add a refresh button for debugging/manual sync
  const handleRefresh = useCallback(async () => {
    await checkActiveShift()
    message.info('Shift status refreshed')
  }, [checkActiveShift])

  if (locationLoading) {
    return (
      <WorkerLayout>
        <Loading text="Getting your location..." fullScreen />
      </WorkerLayout>
    )
  }

  // Show loading while checking shift status
  if (shiftLoading) {
    return (
      <WorkerLayout>
        <Loading text="Checking shift status..." fullScreen />
      </WorkerLayout>
    )
  }

  return (
    <WorkerLayout>
      <div className="p-4 max-w-6xl mx-auto" key={forceRenderKey}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <Title level={2} className="mb-2">
              Welcome back, {user?.firstName}! 👋
            </Title>
            <Button onClick={handleRefresh} size="small">
              Refresh Status
            </Button>
          </div>
          <LocationStatus />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <Statistic
              title="Current Status"
              value={currentShift ? 'Clocked In' : 'Not Clocked In'}
              prefix={currentShift ? <CheckCircleOutlined className="text-green-500" /> : <ExclamationCircleOutlined className="text-orange-500" />}
              valueStyle={{ 
                color: currentShift ? '#52c41a' : '#fa8c16',
                fontSize: '1.2rem'
              }}
            />
          </Card>
          <Card className="text-center">
            <Statistic
              title="Location Status"
              value={isWithinPerimeter ? 'Within Area' : 'Outside Area'}
              prefix={<EnvironmentOutlined className={isWithinPerimeter ? "text-green-500" : "text-red-500"} />}
              valueStyle={{ 
                color: isWithinPerimeter ? '#52c41a' : '#ff4d4f',
                fontSize: '1.2rem'
              }}
            />
          </Card>
          <Card className="text-center sm:col-span-2 lg:col-span-1">
            <Statistic
              title="Current Shift Duration"
              value={currentShiftDuration ? `${currentShiftDuration.hours}h ${currentShiftDuration.minutes}m` : 'N/A'}
              prefix={<ClockCircleOutlined className="text-blue-500" />}
              valueStyle={{ fontSize: '1.2rem' }}
            />
          </Card>
        </div>

        {/* Main Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Clock In/Out Card */}
          <Card className="text-center shadow-lg">
            <Space direction="vertical" size="large" className="w-full">
              <div className="text-6xl text-blue-500 mb-4">
                <ClockCircleOutlined />
              </div>
              
              {/* Debug Info - Remove this after testing */}
              <div className="text-xs text-gray-400 border border-gray-200 p-2 rounded mb-4">
                Debug: {currentShift ? `Active Shift ID: ${currentShift.id}` : 'No Active Shift'} | 
                Loading: {loading ? 'true' : 'false'} | 
                Action: {actionType} |
                Time: {new Date().toLocaleTimeString()}
              </div>
              
              {currentShift ? (
                <>
                  <div>
                    <Tag color="green" className="text-lg px-4 py-2 mb-2">
                      Currently Clocked In
                    </Tag>
                    <div className="mt-2">
                      <Text type="secondary">
                        Since: {new Date(currentShift.clockInTime).toLocaleString()}
                      </Text>
                    </div>
                    {currentShift.clockInNote && (
                      <div className="mt-2">
                        <Text type="secondary" className="text-sm">
                          Note: {currentShift.clockInNote}
                        </Text>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="primary"
                    danger
                    size="large"
                    icon={<LogoutOutlined />}
                    onClick={() => handleClockAction('clockout')}
                    loading={loading && actionType === 'clockout'}
                    className="clock-button h-12 text-lg w-full"
                  >
                    Clock Out
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Title level={4}>Ready to start your shift?</Title>
                    <Text type="secondary" className="block mt-2">
                      {isWithinPerimeter 
                        ? '✅ You are within the designated area' 
                        : '❌ You must be within the designated area to clock in'
                      }
                    </Text>
                  </div>
                  
                  <Button
                    type="primary"
                    size="large"
                    icon={<ClockCircleOutlined />}
                    onClick={() => handleClockAction('clockin')}
                    disabled={!isWithinPerimeter}
                    loading={loading && actionType === 'clockin'}
                    className="clock-button h-12 text-lg w-full"
                  >
                    Clock In
                  </Button>
                </>
              )}
            </Space>
          </Card>

          {/* Current Location Card */}
          <Card className="shadow-lg">
            <Space direction="vertical" className="w-full">
              <div className="flex items-center mb-4">
                <EnvironmentOutlined className="text-2xl text-green-500 mr-2" />
                <Title level={4} className="m-0">Current Location</Title>
              </div>
              
              {location ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Text strong>Latitude:</Text>
                    <Text className="ml-2 font-mono">{location.latitude.toFixed(6)}</Text>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Text strong>Longitude:</Text>
                    <Text className="ml-2 font-mono">{location.longitude.toFixed(6)}</Text>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Text strong>Accuracy:</Text>
                    <Text className="ml-2">±{location.accuracy}m</Text>
                  </div>
                  <div className="mt-4">
                    <Tag 
                      color={isWithinPerimeter ? 'green' : 'red'} 
                      className="text-lg px-4 py-2"
                    >
                      {isWithinPerimeter ? '✅ Within Perimeter' : '❌ Outside Perimeter'}
                    </Tag>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationCircleOutlined className="text-4xl text-orange-500 mb-4" />
                  <Text type="secondary">Location not available</Text>
                </div>
              )}
            </Space>
          </Card>
        </div>

        {/* Shift History */}
        <Card 
          title={
            <div className="flex items-center">
              <CalendarOutlined className="mr-2" />
              Recent Shifts
            </div>
          }
          className="shadow-lg"
        >
          <ShiftHistory />
        </Card>

        {/* Clock Action Modal */}
        <Modal
          title={
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2" />
              {`Clock ${actionType === 'clockin' ? 'In' : 'Out'}`}
            </div>
          }
          open={noteModalVisible}
          onOk={confirmClockAction}
          onCancel={closeModal}
          confirmLoading={loading}
          okText={`Clock ${actionType === 'clockin' ? 'In' : 'Out'}`}
          cancelText="Cancel"
          width={500}
        >
          <Space direction="vertical" className="w-full" size="large">
            <div className="text-center">
              <Text>
                Are you sure you want to clock {actionType === 'clockin' ? 'in' : 'out'}?
              </Text>
              {actionType === 'clockin' && currentShift && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <Text type="warning" className="text-sm">
                    ⚠️ You have an active shift that will be automatically closed first.
                  </Text>
                </div>
              )}
            </div>
            
            <div>
              <Text strong>Optional Note:</Text>
              <TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any notes about your shift..."
                rows={3}
                maxLength={500}
                showCount
                className="mt-2"
              />
            </div>
            
            {location && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <Text type="secondary" className="text-sm">
                  <EnvironmentOutlined className="mr-1" />
                  Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </div>
            )}
          </Space>
        </Modal>
      </div>
    </WorkerLayout>
  )
}