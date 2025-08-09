'use client'

import { useState, useEffect } from 'react'
import { Table, Tag, Space, Typography } from 'antd'
import { ClockCircleOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons'

const { Text } = Typography

export function ActiveStaffTable() {
  const [activeStaff, setActiveStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveStaff()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchActiveStaff, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchActiveStaff = async () => {
    try {
      const response = await fetch('/api/manager/active-staff')
      if (response.ok) {
        const data = await response.json()
        setActiveStaff(data)
      }
    } catch (error) {
      console.error('Error fetching active staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Staff Member',
      key: 'staff',
      render: (record: any) => (
        <Space>
          <UserOutlined />
          <div>
            <div>{record.user.firstName} {record.user.lastName}</div>
            <Text type="secondary" className="text-sm">{record.user.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Clock In Time',
      dataIndex: 'clockInTime',
      key: 'clockInTime',
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined />
          <div>
            <div>{new Date(time).toLocaleTimeString()}</div>
            <Text type="secondary" className="text-sm">
              {new Date(time).toLocaleDateString()}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: any) => {
        const duration = Date.now() - new Date(record.clockInTime).getTime()
        const hours = Math.floor(duration / (1000 * 60 * 60))
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
        return (
          <Tag color="green">
            {hours}h {minutes}m
          </Tag>
        )
      },
    },
    {
      title: 'Clock In Location',
      key: 'location',
      render: (record: any) => (
        <Space>
          <EnvironmentOutlined />
          <div>
            <Text className="text-sm">
              {record.clockInLatitude?.toFixed(4)}, {record.clockInLongitude?.toFixed(4)}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Notes',
      dataIndex: 'clockInNote',
      key: 'notes',
      render: (note: string) => note ? (
        <Text type="secondary" className="text-sm">{note}</Text>
      ) : '-',
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={activeStaff}
      loading={loading}
      rowKey="id"
      pagination={false}
      scroll={{ x: 800 }}
    />
  )
}
