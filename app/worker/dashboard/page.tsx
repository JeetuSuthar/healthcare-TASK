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

  const checkActiveShift = useCallback(async () => {
    try {
      setShiftLoading(true)
      const response = await fetch('/api/shifts/active')
      if (response.ok) {
        const shift = await response.json()
        setCurrentShift(shift)
      }
    } catch (error) {
      console.error('Error checking active shift:', error)
      message.error('Failed to check active shift')
    } finally {
      setShiftLoading(false)
    }
  }, [])

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
      const endpoint = actionType === 'clockin' ? '/api/shifts/clockin' : '/api/shifts/clockout'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          note: note.trim() || undefined,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        message.success(`Successfully clocked ${actionType === 'clockin' ? 'in' : 'out'}!`)
        setCurrentShift(actionType === 'clockin' ? result : null)
        setNoteModalVisible(false)
        setNote('')
        // Refresh shift data
        checkActiveShift()
      } else {
        const error = await response.json()
        message.error(error.message || 'Action failed')
      }
    } catch (error) {
      message.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [actionType, location, note, checkActiveShift])

  const closeModal = useCallback(() => {
    setNoteModalVisible(false)
    setNote('')
  }, [])

  const currentShiftDuration = useMemo(() => {
    if (!currentShift) return null
    
    const startTime = new Date(currentShift.clockInTime)
    const now = new Date()
    const duration = now.getTime() - startTime.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    return { hours, minutes }
  }, [currentShift])

  if (locationLoading) {
    return (
      <WorkerLayout>
        <Loading text="Getting your location..." fullScreen />
      </WorkerLayout>
    )
  }

  return (
    <WorkerLayout>
      <div className="p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            Welcome back, {user?.firstName}! 👋
          </Title>
          <LocationStatus />
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={8}>
            <Card className="text-center h-full">
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
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="text-center h-full">
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
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="text-center h-full">
              <Statistic
                title="Current Shift Duration"
                value={currentShiftDuration ? `${currentShiftDuration.hours}h ${currentShiftDuration.minutes}m` : 'N/A'}
                prefix={<ClockCircleOutlined className="text-blue-500" />}
                valueStyle={{ fontSize: '1.2rem' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-8">
          {/* Clock In/Out Card */}
          <Col xs={24} lg={12}>
            <Card className="text-center h-full shadow-lg">
              <Space direction="vertical" size="large" className="w-full">
                <div className="text-6xl text-blue-500 mb-4">
                  <ClockCircleOutlined />
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
                    </div>
                    
                    <Button
                      type="primary"
                      danger
                      size="large"
                      icon={<LogoutOutlined />}
                      onClick={() => handleClockAction('clockout')}
                      className="clock-button h-12 text-lg"
                      block
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
                      className="clock-button h-12 text-lg"
                      block
                    >
                      Clock In
                    </Button>
                  </>
                )}
              </Space>
            </Card>
          </Col>

          {/* Current Location Card */}
          <Col xs={24} lg={12}>
            <Card className="h-full shadow-lg">
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
          </Col>
        </Row>

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
