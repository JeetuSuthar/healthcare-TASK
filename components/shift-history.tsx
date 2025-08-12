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

  // Mobile-first responsive columns
  const columns = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'clockInTime',
      key: 'date',
      width: '28%',
      render: (time: string) => {
        const full = formatFullIST(time)
        return (
          <Tooltip title={full} placement="top">
            <div className="w-full min-w-0">
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
      width: '18%',
      render: (time: string) => {
        const full = formatFullIST(time)
        return (
          <Tooltip title={full} placement="top">
            <div className="w-full text-center min-w-0">
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
      width: '18%',
      render: (time: string, record: Shift) => time ? (
        <Tooltip title={formatFullIST(time)} placement="top">
          <div className="w-full text-center min-w-0">
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
      width: '16%',
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
        const shortNote = allNotes.length > 12 ? allNotes.slice(0, 9) + '...' : allNotes
        
        return (
          <Tooltip title={allNotes}>
            <div className="w-full text-center min-w-0">
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
      {/* MOBILE-FIRST RESPONSIVE CONTAINER */}
      <div className="w-full max-w-full">
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
              className: 'text-xs responsive-pagination'
            }}
            scroll={{ x: 320 }} // Reduced minimum width for mobile
            size="small"
            className="mobile-responsive-shift-table"
            rowClassName={(record: Shift) => !record.clockOutTime ? 'active-shift-row' : ''}
          />
        </div>
      </div>

      {/* MOBILE-FIRST RESPONSIVE STYLES */}
      <style jsx global>{`
        /* BASE MOBILE STYLES - MOST IMPORTANT */
        .mobile-responsive-shift-table {
          width: 100% !important;
          max-width: 100% !important;
        }
        
        .mobile-responsive-shift-table .ant-table-wrapper {
          width: 100% !important;
          max-width: 100% !important;
        }
        
        .mobile-responsive-shift-table .ant-table-container {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
        }
        
        .mobile-responsive-shift-table .ant-table {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 320px !important; /* Reduced for mobile */
          table-layout: fixed !important;
        }
        
        /* MOBILE COLUMN WIDTHS */
        .mobile-responsive-shift-table .ant-table-thead > tr > th:nth-child(1),
        .mobile-responsive-shift-table .ant-table-tbody > tr > td:nth-child(1) {
          width: 28% !important;
          max-width: 28% !important;
          min-width: 0 !important;
        }
        
        .mobile-responsive-shift-table .ant-table-thead > tr > th:nth-child(2),
        .mobile-responsive-shift-table .ant-table-tbody > tr > td:nth-child(2) {
          width: 18% !important;
          max-width: 18% !important;
          min-width: 0 !important;
        }
        
        .mobile-responsive-shift-table .ant-table-thead > tr > th:nth-child(3),
        .mobile-responsive-shift-table .ant-table-tbody > tr > td:nth-child(3) {
          width: 18% !important;
          max-width: 18% !important;
          min-width: 0 !important;
        }
        
        .mobile-responsive-shift-table .ant-table-thead > tr > th:nth-child(4),
        .mobile-responsive-shift-table .ant-table-tbody > tr > td:nth-child(4) {
          width: 16% !important;
          max-width: 16% !important;
          min-width: 0 !important;
        }
        
        .mobile-responsive-shift-table .ant-table-thead > tr > th:nth-child(5),
        .mobile-responsive-shift-table .ant-table-tbody > tr > td:nth-child(5) {
          width: 20% !important;
          max-width: 20% !important;
          min-width: 0 !important;
        }
        
        /* MOBILE CELL STYLES */
        .mobile-responsive-shift-table .ant-table-thead > tr > th,
        .mobile-responsive-shift-table .ant-table-tbody > tr > td {
          padding: 6px 2px !important;
          font-size: 10px !important;
          border-bottom: 1px solid #f0f0f0;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        
        .mobile-responsive-shift-table .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          text-align: center;
          font-size: 10px !important;
        }
        
        /* PREVENT OVERFLOW */
        .mobile-responsive-shift-table * {
          box-sizing: border-box !important;
        }
        
        .mobile-responsive-shift-table .truncate,
        .mobile-responsive-shift-table div {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          max-width: 100% !important;
        }
        
        /* ACTIVE ROW STYLING */
        .mobile-responsive-shift-table .active-shift-row {
          background-color: #f6ffed !important;
          border-left: 2px solid #52c41a !important;
        }
        
        /* MOBILE SCROLLBAR */
        .mobile-responsive-shift-table .ant-table-body::-webkit-scrollbar {
          height: 3px;
        }
        
        .mobile-responsive-shift-table .ant-table-body::-webkit-scrollbar-track {
          background: #f8f9fa;
          border-radius: 2px;
        }
        
        .mobile-responsive-shift-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #dee2e6;
          border-radius: 2px;
        }
        
        .mobile-responsive-shift-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #adb5bd;
        }
        
        /* RESPONSIVE PAGINATION */
        .responsive-pagination {
          margin: 8px 0 !important;
        }
        
        .responsive-pagination .ant-pagination-item,
        .responsive-pagination .ant-pagination-prev,
        .responsive-pagination .ant-pagination-next {
          min-width: 24px !important;
          height: 24px !important;
          line-height: 22px !important;
          margin: 0 1px !important;
          font-size: 10px !important;
        }
        
        .responsive-pagination .ant-pagination-total-text {
          font-size: 10px !important;
        }
        
        /* TABLET AND DESKTOP IMPROVEMENTS */
        @media (min-width: 640px) {
          .mobile-responsive-shift-table .ant-table {
            min-width: 400px !important;
          }
          
          .mobile-responsive-shift-table .ant-table-thead > tr > th,
          .mobile-responsive-shift-table .ant-table-tbody > tr > td {
            padding: 8px 4px !important;
            font-size: 11px !important;
          }
          
          .mobile-responsive-shift-table .ant-table-thead > tr > th {
            font-size: 11px !important;
          }
          
          .responsive-pagination .ant-pagination-item,
          .responsive-pagination .ant-pagination-prev,
          .responsive-pagination .ant-pagination-next {
            min-width: 28px !important;
            height: 28px !important;
            line-height: 26px !important;
            margin: 0 2px !important;
            font-size: 12px !important;
          }
          
          .responsive-pagination .ant-pagination-total-text {
            font-size: 12px !important;
          }
        }
        
        @media (min-width: 768px) {
          .mobile-responsive-shift-table .ant-table-thead > tr > th,
          .mobile-responsive-shift-table .ant-table-tbody > tr > td {
            padding: 10px 6px !important;
            font-size: 12px !important;
          }
          
          .mobile-responsive-shift-table .ant-table-thead > tr > th {
            font-size: 12px !important;
          }
        }
        
        /* FINAL SAFETY - NO HORIZONTAL OVERFLOW */
        .mobile-responsive-shift-table,
        .mobile-responsive-shift-table .ant-table-wrapper,
        .mobile-responsive-shift-table .ant-table-container {
          max-width: 100vw !important;
        }
      `}</style>
    </>
  )
}