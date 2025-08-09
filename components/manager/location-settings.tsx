'use client'

import { useState, useEffect } from 'react'
import { Form, Input, Button, message, Card, Typography, Space, InputNumber } from 'antd'
import { EnvironmentOutlined, SaveOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export function LocationSettings({ onClose }: { onClose: () => void }) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentSettings, setCurrentSettings] = useState<any>(null)

  // Default Pune location
  const defaultValues = {
    name: 'Popular Colony, Warje Malwadi, Pune',
    latitude: 18.4777,
    longitude: 73.8037,
    radius: 2000,
  }

  useEffect(() => {
    fetchCurrentSettings()
  }, [])

  const fetchCurrentSettings = async () => {
    try {
      const response = await fetch('/api/settings/perimeter')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setCurrentSettings(data)
          form.setFieldsValue(data)
        } else {
          // No perimeter set, use default values
          form.setFieldsValue(defaultValues)
        }
      } else {
        // API error, use default values
        form.setFieldsValue(defaultValues)
      }
    } catch (error) {
      // Network error, use default values
      form.setFieldsValue(defaultValues)
    }
  }

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/perimeter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        message.success('Location settings updated successfully!')
        onClose()
      } else {
        message.error('Failed to update settings')
      }
    } catch (error) {
      message.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setFieldsValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        message.success('Current location set!')
      },
      (error) => {
        message.error('Unable to get current location')
      }
    )
  }

  return (
    <div>
      <Card>
        <Title level={4}>
          <EnvironmentOutlined /> Location Perimeter Settings
        </Title>
        <Text type="secondary">
          Set the location and radius where healthcare workers can clock in and out.
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="mt-6"
        >
          <Form.Item
            name="name"
            label="Location Name"
            rules={[{ required: true, message: 'Please enter a location name' }]}
          >
            <Input placeholder="e.g., Main Hospital Building" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[
                { required: true, message: 'Please enter latitude' },
                { type: 'number', min: -90, max: 90, message: 'Invalid latitude' }
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="e.g., 40.7128"
                precision={6}
              />
            </Form.Item>

            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[
                { required: true, message: 'Please enter longitude' },
                { type: 'number', min: -180, max: 180, message: 'Invalid longitude' }
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="e.g., -74.0060"
                precision={6}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="radius"
            label="Radius (meters)"
            rules={[
              { required: true, message: 'Please enter radius' },
              { type: 'number', min: 10, max: 5000, message: 'Radius must be between 10 and 5000 meters' }
            ]}
          >
            <InputNumber
              className="w-full"
              placeholder="e.g., 2000"
              addonAfter="meters"
            />
          </Form.Item>

          <Space className="w-full justify-between">
            <Button onClick={getCurrentLocation}>
              Use Current Location
            </Button>
            
            <Space>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Save Settings
              </Button>
            </Space>
          </Space>
        </Form>
      </Card>
    </div>
  )
}
