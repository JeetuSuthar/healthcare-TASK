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
      }).replace(' IST', '')
    )
  }, [])

  const timeAgo = useCallback((time: string) => {
    const now = Date.now()
    const past = new Date(time).getTime()
    const diff = Math.max(0, now - past)
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }, [])

  // Compact columns with percentage-based widths
  const columns = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'clockInTime',
      key: 'date',
      width: '25%',
      render: (time: string) => {
        const full = formatFullIST(time)
        return (
          <Tooltip title={full} placement="top">
            <div className="w-full">
              <div className="text-xs font-medium truncate">{formatDate(time)}</div>
              <div className="text-xs text-gray-500 truncate">{timeAgo(time)}</div>
            </div>
          </Tooltip>
        )
      },
      sorter: (a: Shift, b: Shift) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'In',
      dataIndex: 'clockInTime',
      key: 'clockIn',
      width: '20%',
      render: (time: string) => {
        const full = formatFullIST(time)
        return (
          <Tooltip title={full} placement="top">
            <div className="w-full text-center">
              <div className="text-xs font-medium text-green-600 truncate">{formatTime(time)}</div>
              <div className="text-xs text-gray-500 truncate">{timeAgo(time)}</div>
            </div>
          </Tooltip>
        )
      },
    },
    {
      title: 'Out',
      dataIndex: 'clockOutTime',
      key: 'clockOut',
      width: '20%',
      render: (time: string, record: Shift) => time ? (
        <Tooltip title={formatFullIST(time)} placement="top">
          <div className="w-full text-center">
            <div className="text-xs font-medium text-red-600 truncate">{formatTime(time)}</div>
            <div className="text-xs text-gray-500 truncate">{timeAgo(time)}</div>
          </div>
        </Tooltip>
      ) : (
        <div className="w-full text-center">
          <Tag color="green" className="text-xs px-1 py-0">Active</Tag>
        </div>
      ),
    },
    {
      title: 'Hours',
      key: 'duration',
      width: '15%',
      render: (record: Shift) => {
        const duration = calculateDuration(record.clockInTime, record.clockOutTime)
        if (!duration) {
          return <div className="w-full text-center text-xs text-green-600 font-medium">--</div>
        }
        return (
          <div className="w-full text-center">
            <div className="text-xs font-medium">{duration.hours}h {duration.minutes}m</div>
          </div>
        )
      },
    },
    {
      title: 'Notes',
      dataIndex: 'clockInNote',
      key: 'notes',
      width: '20%',
      render: (clockInNote: string, record: Shift) => {
        const hasNotes = clockInNote || record.clockOutNote
        if (!hasNotes) {
          return <div className="w-full text-center text-xs text-gray-400">--</div>
        }
        
        const allNotes = [clockInNote, record.clockOutNote].filter(Boolean).join(' | ')
        const shortNote = allNotes.length > 15 ? allNotes.slice(0, 12) + '...' : allNotes
        
        return (
          <Tooltip title={allNotes}>
            <div className="w-full text-center">
              <div className="text-xs text-blue-600 truncate">{shortNote}</div>
            </div>
          </Tooltip>
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
    <>
      {/* ABSOLUTELY CONSTRAINED CONTAINER */}
      <div className="w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table
            columns={columns}
            dataSource={shifts}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
              size: 'small',
              className: 'text-xs'
            }}
            scroll={{ x: 400 }}
            size="small"
            className="compact-shift-table"
            rowClassName={(record: Shift) => !record.clockOutTime ? 'active-shift-row' : ''}
          />
        </div>
      </div>

      {/* CRITICAL: Styles that FORCE container constraints */}
      <style jsx global>{`
        /* CONTAINER CONSTRAINTS - MOST IMPORTANT */
        .compact-shift-table {
          width: 100% !important;
          max-width: 100% !important;
          overflow: hidden !important;
        }
        
        .compact-shift-table .ant-table-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          overflow: hidden !important;
        }
        
        .compact-shift-table .ant-table-container {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
        }
        
        .compact-shift-table .ant-table {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 400px !important;
          table-layout: fixed !important;
        }
        
        /* FORCE COLUMN WIDTHS */
        .compact-shift-table .ant-table-thead > tr > th:nth-child(1),
        .compact-shift-table .ant-table-tbody > tr > td:nth-child(1) {
          width: 25% !important;
          max-width: 25% !important;
          min-width: 0 !important;
        }
        
        .compact-shift-table .ant-table-thead > tr > th:nth-child(2),
        .compact-shift-table .ant-table-tbody > tr > td:nth-child(2) {
          width: 20% !important;
          max-width: 20% !important;
          min-width: 0 !important;
        }
        
        .compact-shift-table .ant-table-thead > tr > th:nth-child(3),
        .compact-shift-table .ant-table-tbody > tr > td:nth-child(3) {
          width: 20% !important;
          max-width: 20% !important;
          min-width: 0 !important;
        }
        
        .compact-shift-table .ant-table-thead > tr > th:nth-child(4),
        .compact-shift-table .ant-table-tbody > tr > td:nth-child(4) {
          width: 15% !important;
          max-width: 15% !important;
          min-width: 0 !important;
        }
        
        .compact-shift-table .ant-table-thead > tr > th:nth-child(5),
        .compact-shift-table .ant-table-tbody > tr > td:nth-child(5) {
          width: 20% !important;
          max-width: 20% !important;
          min-width: 0 !important;
        }
        
        /* CELL CONTENT CONSTRAINTS */
        .compact-shift-table .ant-table-thead > tr > th,
        .compact-shift-table .ant-table-tbody > tr > td {
          padding: 8px 4px !important;
          font-size: 11px !important;
          border-bottom: 1px solid #f0f0f0;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        
        .compact-shift-table .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          text-align: center;
        }
        
        /* PREVENT ANY EXPANSION */
        .compact-shift-table * {
          box-sizing: border-box !important;
        }
        
        .compact-shift-table .truncate,
        .compact-shift-table div {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          max-width: 100% !important;
        }
        
        /* ACTIVE ROW STYLING */
        .compact-shift-table .active-shift-row {
          background-color: #f6ffed !important;
          border-left: 3px solid #52c41a !important;
        }
        
        /* MOBILE OPTIMIZATIONS */
        @media (max-width: 640px) {
          .compact-shift-table .ant-table {
            min-width: 350px !important;
          }
          
          .compact-shift-table .ant-table-thead > tr > th,
          .compact-shift-table .ant-table-tbody > tr > td {
            padding: 6px 2px !important;
            font-size: 10px !important;
          }
          
          .compact-shift-table .ant-table-pagination {
            margin: 8px 0 !important;
            text-align: center;
          }
          
          .compact-shift-table .ant-pagination-item,
          .compact-shift-table .ant-pagination-prev,
          .compact-shift-table .ant-pagination-next {
            min-width: 28px !important;
            height: 28px !important;
            line-height: 26px !important;
            margin: 0 2px !important;
          }
        }
        
        /* SCROLLBAR STYLING */
        .compact-shift-table .ant-table-body::-webkit-scrollbar {
          height: 4px;
        }
        
        .compact-shift-table .ant-table-body::-webkit-scrollbar-track {
          background: #f8f9fa;
          border-radius: 2px;
        }
        
        .compact-shift-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #dee2e6;
          border-radius: 2px;
        }
        
        .compact-shift-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #adb5bd;
        }
        
        /* FINAL SAFETY NET - PREVENT ANY OVERFLOW */
        .compact-shift-table,
        .compact-shift-table *,
        .compact-shift-table .ant-table-wrapper,
        .compact-shift-table .ant-table-container,
        .compact-shift-table .ant-table {
          overflow-x: auto !important;
          max-width: 100% !important;
        }
      `}</style>
    </>
  )
}