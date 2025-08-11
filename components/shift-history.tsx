'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Table, Tag, Typography, Space, Empty, Tooltip, Badge } from 'antd'
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

  const TIME_ZONE = 'Asia/Kolkata'

  // Full combined formatter for tooltip
  const formatFullIST = useCallback((time: string) => {
    const d = new Date(time)
    return d.toLocaleString('en-IN', {
      timeZone: TIME_ZONE,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST'
  }, [])

  const formatDate = useCallback((time: string) => {
    const d = new Date(time)
    return d.toLocaleDateString('en-IN', {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    })
  }, [])

  const formatTime = useCallback((time: string) => {
    const d = new Date(time)
    return (
      d.toLocaleTimeString('en-IN', {
        timeZone: TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' IST'
    )
  }, [])

  const timeAgo = useCallback((time: string) => {
    const now = Date.now()
    const past = new Date(time).getTime()
    const diff = Math.max(0, now - past)
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h ago`
  }, [])

  const columns = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'clockInTime',
      key: 'date',
      render: (time: string) => {
        const full = formatFullIST(time)
        return (
          <Tooltip title={full} placement="top">
            <div className="flex items-center">
              <CalendarOutlined className="mr-2 text-blue-500" />
              <div className="flex flex-col leading-tight">
                <Text strong className="text-[13px] sm:text-sm">{formatDate(time)}</Text>
                <Text type="secondary" className="text-[11px] sm:text-xs">{timeAgo(time)}</Text>
              </div>
            </div>
          </Tooltip>
        )
      },
      sorter: (a: Shift, b: Shift) => new Date(a.clockInTime).getTime() - new Date(b.clockInTime).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Clock In',
      dataIndex: 'clockInTime',
      key: 'clockIn',
      render: (time: string) => {
        const full = formatFullIST(time)
        return (
          <Tooltip title={full} placement="top">
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2 text-green-500" />
              <div className="flex flex-col leading-tight">
                <Text className="text-[13px] sm:text-sm">{formatTime(time)}</Text>
                <Text type="secondary" className="text-[11px] sm:text-xs">{timeAgo(time)}</Text>
              </div>
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Clock Out',
      dataIndex: 'clockOutTime',
      key: 'clockOut',
      render: (time: string, record: Shift) => time ? (
        (() => {
          const full = formatFullIST(time)
          return (
            <Tooltip title={full} placement="top">
              <div className="flex items-center">
                <ClockCircleOutlined className="mr-2 text-red-500" />
                <div className="flex flex-col leading-tight">
                  <Text className="text-[13px] sm:text-sm">{formatTime(time)}</Text>
                  <Text type="secondary" className="text-[11px] sm:text-xs">{timeAgo(time)}</Text>
                </div>
              </div>
            </Tooltip>
          )
        })()
      ) : (
        <Tag color="green" className="flex items-center gap-1 animate-pulse">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
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
          <div className="flex flex-col">
            <Text strong className="text-[13px] sm:text-sm">
              {duration.hours}h {duration.minutes}m
            </Text>
            <Text type="secondary" className="text-[11px] sm:text-xs">
              {(duration.hours * 60 + duration.minutes)} mins
            </Text>
          </div>
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
        const clip = (val?: string) => val && val.length > 60 ? val.slice(0, 57) + '…' : val
        return (
          <Space direction="vertical" size={2} className="w-full">
            {clockInNote && (
              <Tooltip title={clockInNote}>
                <div className="bg-blue-50 border border-blue-100 px-2 py-1 rounded text-[11px] sm:text-xs w-full">
                  <span className="font-medium mr-1 text-blue-600">In:</span>{clip(clockInNote)}
                </div>
              </Tooltip>
            )}
            {record.clockOutNote && (
              <Tooltip title={record.clockOutNote}>
                <div className="bg-green-50 border border-green-100 px-2 py-1 rounded text-[11px] sm:text-xs w-full">
                  <span className="font-medium mr-1 text-green-600">Out:</span>{clip(record.clockOutNote)}
                </div>
              </Tooltip>
            )}
          </Space>
        )
      },
    },
  ], [calculateDuration, formatTime, formatDate, formatFullIST, timeAgo])

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
      scroll={{ x: 900 }}
      className="shift-history-table"
      rowClassName={(record: Shift) => !record.clockOutTime ? 'active-shift-row' : ''}
    />
  )
}
