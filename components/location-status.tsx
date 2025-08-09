'use client'

import { Card, Tag, Button, Space } from 'antd'
import { EnvironmentOutlined, ReloadOutlined } from '@ant-design/icons'
import { useLocation } from '@/hooks/use-location'

export function LocationStatus() {
  const { location, isWithinPerimeter, loading, refreshLocation } = useLocation()

  return (
    <Card size="small" className="mb-4">
      <Space className="w-full justify-between">
        <div className="flex items-center">
          <EnvironmentOutlined className="text-green-500 mr-2 location-indicator" />
          <span>Location Status: </span>
          <Tag color={isWithinPerimeter ? 'green' : 'red'}>
            {isWithinPerimeter ? 'Within Perimeter' : 'Outside Perimeter'}
          </Tag>
        </div>
        <Button
          size="small"
          icon={<ReloadOutlined />}
          onClick={refreshLocation}
          loading={loading}
        >
          Refresh
        </Button>
      </Space>
    </Card>
  )
}
