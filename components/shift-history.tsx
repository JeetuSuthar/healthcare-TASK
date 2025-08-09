'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Table, Tag, Typography, Space, Empty, Spin } from 'antd'
import { ClockCircleOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons'
import { Loading } from '@/components/ui/loading'

const { Text } = Typography

interface Shift {
  id: string
  clockInTime: string
  clockOutTime?: string
  clockInNote?: string
  clockOutNote?: string
  duration?: number
}

export const ShiftHistory = () => {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchShiftHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/shifts/history')
      if (response.ok) {
        const data = await response.json()
        setShifts(data)
      } else {
        throw new Error('Failed to fetch shift history')
      }
    } catch (error) {
      console.error('Error fetching shift history:', error)
      setError('Failed to load shift history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchShiftHistory()
  }, [fetchShiftHistory])

  const calculateDuration = useCallback((clockInTime: string, clockOutTime?: string) => {
    if (!clockOutTime) return null
    
    const duration = new Date(clockOutTime).getTime() - new Date(clockInTime).getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    
    return { hours, minutes }
  }, [])

  const formatTime = useCallback((time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }, [])

  const formatDate = useCallback((time: string) => {
    return new Date(time).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }, [])

  const columns = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'clockInTime',
      key: 'date',
      render: (time: string) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-blue-500" />
          <Text strong>{formatDate(time)}</Text>
        </div>
      ),
      sorter: (a: Shift, b: Shift) => new Date(a.clockInTime).getTime() - new Date(b.clockInTime).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Clock In',
      dataIndex: 'clockInTime',
      key: 'clockIn',
      render: (time: string) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-green-500" />
          <Text>{formatTime(time)}</Text>
        </div>
      ),
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOut',
      render: (time: string, record: Shift) => time ? (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-2 text-red-500" />
          <Text>{formatTime(time)}</Text>
        </div>
      ) : (
        <Tag color="green" className="flex items-center">
          <ClockCircleOutlined className="mr-1" />
          Active
        </Tag>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (record: Shift) => {
        const duration = calculateDuration(record.clockInTime, record.clockOutTime)
        if (!duration) return '-'
        return (
          <Text strong>
            {duration.hours}h {duration.minutes}m
          </Text>
        )
      },
    },
    {
      title: 'Notes',
      dataIndex: 'clockInNote',
      key: 'notes',
      render: (clockInNote: string, record: Shift) => {
        const hasNotes = clockInNote || record.clockOutNote
        if (!hasNotes) {
          return <Text type="secondary">No notes</Text>
        }
        
        return (
          <div className="space-y-1">
            {clockInNote && (
              <div className="bg-blue-50 p-2 rounded text-sm">
                <Text type="secondary" className="text-xs">In:</Text>
                <Text className="block">{clockInNote}</Text>
              </div>
            )}
            {record.clockOutNote && (
              <div className="bg-green-50 p-2 rounded text-sm">
                <Text type="secondary" className="text-xs">Out:</Text>
                <Text className="block">{record.clockOutNote}</Text>
              </div>
            )}
          </div>
        )
      },
    },
  ], [calculateDuration, formatTime, formatDate])

  if (loading) {
    return <Loading text="Loading shift history..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Empty
          description={
            <div>
              <Text type="secondary">{error}</Text>
              <br />
              <Text 
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={fetchShiftHistory}
              >
                Try again
              </Text>
            </div>
          }
        />
      </div>
    )
  }

  if (shifts.length === 0) {
    return (
      <div className="text-center py-8">
        <Empty
          description="No shift history found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    )
  }

  return (
    <Table
      columns={columns}
      dataSource={shifts}
      rowKey="id"
      pagination={{ 
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} shifts`,
      }}
      scroll={{ x: 800 }}
      className="shift-history-table"
    />
  )
}
