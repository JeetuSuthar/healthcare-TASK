'use client'

import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, InputNumber, Switch, Divider, message, Space, Typography, Row, Col, Select, TimePicker, Tag } from 'antd'
import { EnvironmentOutlined, ClockCircleOutlined, TeamOutlined, BellOutlined, SecurityScanOutlined, SettingOutlined } from '@ant-design/icons'
import { ManagerLayout } from '@/components/layouts/manager-layout'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface PerimeterSettings {
  name: string
  latitude: number
  longitude: number
  radius: number
}

interface NotificationSettings {
  emailAlerts: boolean
  smsAlerts: boolean
  shiftReminders: boolean
  lateClockInAlerts: boolean
  geofenceAlerts: boolean
}

interface WorkSettings {
  maxShiftHours: number
  minBreakMinutes: number
  overtimeThreshold: number
  autoClockOut: boolean
  clockInWindow: number // minutes before/after scheduled time
  requireNotes: boolean
}

interface SystemSettings {
  companyName: string
  timezone: string
  workingDays: string[]
  workStartTime: string
  workEndTime: string
  emergencyContact: string
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'UTC', label: 'UTC' },
]

export default function ManagerSettings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('perimeter')
  const [formValues, setFormValues] = useState<any>({}) // For live preview
  const [perimeterSettings, setPerimeterSettings] = useState<PerimeterSettings>({
    name: 'Main Work Area',
    latitude: 40.7128,
    longitude: -74.0060,
    radius: 100
  })
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailAlerts: true,
    smsAlerts: false,
    shiftReminders: true,
    lateClockInAlerts: true,
    geofenceAlerts: true
  })
  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    maxShiftHours: 12,
    minBreakMinutes: 30,
    overtimeThreshold: 8,
    autoClockOut: false,
    clockInWindow: 15,
    requireNotes: false
  })
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: 'Healthcare Facility',
    timezone: 'America/New_York',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workStartTime: '09:00',
    workEndTime: '17:00',
    emergencyContact: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)

      // Load perimeter settings
      const perimeterResponse = await fetch('/api/settings/perimeter')
      if (perimeterResponse.ok) {
        const perimeterData = await perimeterResponse.json()
        setPerimeterSettings(perimeterData)
      }

      // Load other settings (you can add more API endpoints)
      // For now, using default values

    } catch (error) {
      console.error('Error loading settings:', error)
      message.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const savePerimeterSettings = async (values: PerimeterSettings) => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/perimeter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        setPerimeterSettings(values)
        message.success('Perimeter settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving perimeter:', error)
      message.error('Failed to save perimeter settings')
    } finally {
      setLoading(false)
    }
  }

  const saveNotificationSettings = async (values: NotificationSettings) => {
    setNotificationSettings(values)
    message.success('Notification settings saved!')
    // TODO: Add API call when backend is ready
  }

  const saveWorkSettings = async (values: WorkSettings) => {
    setWorkSettings(values)
    message.success('Work policies saved!')
    // TODO: Add API call when backend is ready
  }

  const saveSystemSettings = async (values: SystemSettings) => {
    setSystemSettings(values)
    message.success('System settings saved!')
    // TODO: Add API call when backend is ready
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setFieldsValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          message.success('Current location loaded!')
        },
        (error) => {
          console.error('Error getting location:', error)
          message.error('Unable to get current location')
        }
      )
    } else {
      message.error('Geolocation is not supported by this browser')
    }
  }

  const tabs = [
    { key: 'perimeter', label: 'Work Area', icon: <EnvironmentOutlined /> },
    { key: 'notifications', label: 'Notifications', icon: <BellOutlined /> },
    { key: 'work', label: 'Work Policies', icon: <ClockCircleOutlined /> },
    { key: 'system', label: 'System', icon: <SettingOutlined /> },
  ]

  return (
    <ManagerLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="!mb-2 flex items-center gap-2">
            <SettingOutlined className="text-blue-500" />
            Settings
          </Title>
          <Text type="secondary">
            Configure your healthcare facility management settings
          </Text>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-t-lg border-b-2 transition-colors flex items-center gap-2 text-sm font-medium ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Perimeter Settings */}
        {activeTab === 'perimeter' && (
          <Card title={
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-green-500" />
              Work Area Configuration
            </div>
          }>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Text className="text-blue-800">
                <strong>Configure your work area perimeter:</strong> Set the geographic boundaries where staff can clock in/out. 
                Workers must be within this area to clock in, and they'll receive notifications when entering or leaving the perimeter.
              </Text>
            </div>
            <Form
              form={form}
              layout="vertical"
              initialValues={perimeterSettings}
              onFinish={savePerimeterSettings}
              onValuesChange={(_, allValues) => setFormValues(allValues)}
            >
              <Form.Item
                label="Work Area Name"
                name="name"
                rules={[{ required: true, message: 'Please enter a name for the work area' }]}
              >
                <Input placeholder="Main Work Area" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Latitude"
                    name="latitude"
                    rules={[{ required: true, message: 'Please enter latitude' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      step={0.000001}
                      precision={6}
                      placeholder="40.712800"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Longitude"
                    name="longitude"
                    rules={[{ required: true, message: 'Please enter longitude' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      step={0.000001}
                      precision={6}
                      placeholder="-74.006000"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Radius (meters)"
                name="radius"
                rules={[{ required: true, message: 'Please enter radius' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={10}
                  max={10000}
                  step={10}
                  placeholder="100"
                  addonAfter="meters"
                />
              </Form.Item>

              <div className="flex gap-3 flex-wrap">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Save Work Area
                </Button>
                <Button
                  onClick={getCurrentLocation}
                  icon={<EnvironmentOutlined />}
                >
                  Use Current Location
                </Button>
              </div>

              {/* Visual Preview */}
              <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                <Text strong className="block mb-3">Location Preview:</Text>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text className="text-sm text-gray-600">Coordinates:</Text>
                    <div className="mt-1 font-mono text-sm">
                      {(formValues.latitude || perimeterSettings.latitude)?.toFixed(6) || '0.000000'}, {(formValues.longitude || perimeterSettings.longitude)?.toFixed(6) || '0.000000'}
                    </div>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600">Coverage Area:</Text>
                    <div className="mt-1 text-sm">
                      {formValues.radius || perimeterSettings.radius || 0} meter radius
                      <br />
                      <Text type="secondary" className="text-xs">
                        ≈ {Math.round(Math.PI * Math.pow(formValues.radius || perimeterSettings.radius || 0, 2))} m² coverage
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white border rounded">
                  <Text className="text-xs text-gray-500">
                    🗺️ <strong>{formValues.name || perimeterSettings.name}:</strong> Workers within {formValues.radius || perimeterSettings.radius}m of this location can clock in/out
                  </Text>
                </div>
              </div>
            </Form>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card title={
            <div className="flex items-center gap-2">
              <BellOutlined className="text-blue-500" />
              Notification Preferences
            </div>
          }>
            <Form
              layout="vertical"
              initialValues={notificationSettings}
              onFinish={saveNotificationSettings}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Alert Types" className="h-full">
                    <Space direction="vertical" size="middle" className="w-full">
                      <Form.Item name="emailAlerts" valuePropName="checked" className="!mb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text strong>Email Alerts</Text>
                            <div className="text-sm text-gray-500">Receive notifications via email</div>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>

                      <Form.Item name="smsAlerts" valuePropName="checked" className="!mb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text strong>SMS Alerts</Text>
                            <div className="text-sm text-gray-500">Receive notifications via SMS</div>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Event Notifications" className="h-full">
                    <Space direction="vertical" size="middle" className="w-full">
                      <Form.Item name="shiftReminders" valuePropName="checked" className="!mb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text strong>Shift Reminders</Text>
                            <div className="text-sm text-gray-500">Upcoming shift notifications</div>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>

                      <Form.Item name="lateClockInAlerts" valuePropName="checked" className="!mb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text strong>Late Clock-In Alerts</Text>
                            <div className="text-sm text-gray-500">Alert when staff is late</div>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>

                      <Form.Item name="geofenceAlerts" valuePropName="checked" className="!mb-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text strong>Location Alerts</Text>
                            <div className="text-sm text-gray-500">Geofence entry/exit notifications</div>
                          </div>
                          <Switch />
                        </div>
                      </Form.Item>
                    </Space>
                  </Card>
                </Col>
              </Row>

              <div className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Save Notification Settings
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* Work Policies */}
        {activeTab === 'work' && (
          <Card title={
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-orange-500" />
              Work Policies & Rules
            </div>
          }>
            <Form
              layout="vertical"
              initialValues={workSettings}
              onFinish={saveWorkSettings}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Shift Policies" className="h-full">
                    <Form.Item
                      label="Maximum Shift Hours"
                      name="maxShiftHours"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={1}
                        max={24}
                        style={{ width: '100%' }}
                        addonAfter="hours"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Minimum Break Time"
                      name="minBreakMinutes"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={0}
                        max={120}
                        style={{ width: '100%' }}
                        addonAfter="minutes"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Overtime Threshold"
                      name="overtimeThreshold"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={1}
                        max={24}
                        style={{ width: '100%' }}
                        addonAfter="hours"
                      />
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Clock-In/Out Rules" className="h-full">
                    <Form.Item
                      label="Clock-In Window"
                      name="clockInWindow"
                      help="Minutes before/after scheduled time"
                    >
                      <InputNumber
                        min={0}
                        max={60}
                        style={{ width: '100%' }}
                        addonAfter="minutes"
                      />
                    </Form.Item>

                    <Form.Item name="autoClockOut" valuePropName="checked">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text strong>Auto Clock-Out</Text>
                          <div className="text-sm text-gray-500">Automatically clock out after max hours</div>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>

                    <Form.Item name="requireNotes" valuePropName="checked">
                      <div className="flex items-center justify-between">
                        <div>
                          <Text strong>Require Notes</Text>
                          <div className="text-sm text-gray-500">Mandatory notes for clock actions</div>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <div className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Save Work Policies
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <Card title={
            <div className="flex items-center gap-2">
              <SettingOutlined className="text-purple-500" />
              System Configuration
            </div>
          }>
            <Form
              layout="vertical"
              initialValues={systemSettings}
              onFinish={saveSystemSettings}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" title="Organization Details" className="h-full">
                    <Form.Item
                      label="Company/Facility Name"
                      name="companyName"
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="Healthcare Facility Name" />
                    </Form.Item>

                    <Form.Item
                      label="Timezone"
                      name="timezone"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        {TIMEZONES.map(tz => (
                          <Option key={tz.value} value={tz.value}>
                            {tz.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Emergency Contact"
                      name="emergencyContact"
                    >
                      <Input placeholder="+1 (555) 123-4567" />
                    </Form.Item>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card size="small" title="Working Schedule" className="h-full">
                    <Form.Item
                      label="Working Days"
                      name="workingDays"
                      rules={[{ required: true }]}
                    >
                      <Select mode="multiple" placeholder="Select working days">
                        {DAYS_OF_WEEK.map(day => (
                          <Option key={day} value={day}>
                            {day}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Row gutter={8}>
                      <Col span={12}>
                        <Form.Item
                          label="Work Start Time"
                          name="workStartTime"
                          rules={[{ required: true }]}
                        >
                          <TimePicker
                            format="HH:mm"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Work End Time"
                          name="workEndTime"
                          rules={[{ required: true }]}
                        >
                          <TimePicker
                            format="HH:mm"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              <div className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Save System Settings
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* Current Status Summary */}
        <Card className="mt-6" title="Current Configuration Summary">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <EnvironmentOutlined className="text-2xl text-green-500 mb-2" />
                <Text strong className="block">Work Area</Text>
                <Text type="secondary" className="text-sm">
                  {perimeterSettings.radius}m radius
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <BellOutlined className="text-2xl text-blue-500 mb-2" />
                <Text strong className="block">Notifications</Text>
                <Text type="secondary" className="text-sm">
                  {notificationSettings.emailAlerts ? 'Email On' : 'Email Off'}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <ClockCircleOutlined className="text-2xl text-orange-500 mb-2" />
                <Text strong className="block">Max Shift</Text>
                <Text type="secondary" className="text-sm">
                  {workSettings.maxShiftHours} hours
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className="text-center p-4 border rounded-lg">
                <TeamOutlined className="text-2xl text-purple-500 mb-2" />
                <Text strong className="block">Working Days</Text>
                <Text type="secondary" className="text-sm">
                  {systemSettings.workingDays.length} days/week
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </ManagerLayout>
  )
}
