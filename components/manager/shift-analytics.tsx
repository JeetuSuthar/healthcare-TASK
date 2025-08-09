'use client'

import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Select, DatePicker, Space } from 'antd'
import { Line, Bar, Pie } from '@ant-design/plots'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

export function ShiftAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ])
  const [viewType, setViewType] = useState('daily')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, viewType])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/manager/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          viewType,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const dailyHoursConfig = {
    data: analyticsData.dailyHours || [],
    xField: 'date',
    yField: 'hours',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  }

  const staffHoursConfig = {
    data: analyticsData.staffHours || [],
    xField: 'hours',
    yField: 'staff',
    seriesField: 'staff',
  }

  const shiftDistributionConfig = {
    data: analyticsData.shiftDistribution || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  }

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]])
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
          />
          <Select
            value={viewType}
            onChange={setViewType}
            style={{ width: 120 }}
          >
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
          </Select>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Daily Hours Trend" loading={loading}>
            <Line {...dailyHoursConfig} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Staff Hours Distribution" loading={loading}>
            <Bar {...staffHoursConfig} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Shift Type Distribution" loading={loading}>
            <Pie {...shiftDistributionConfig} />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Statistic
                  title="Average Shift Duration"
                  value={analyticsData.avgShiftDuration || 0}
                  precision={1}
                  suffix="hours"
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                <Statistic
                  title="Total Shifts This Period"
                  value={analyticsData.totalShifts || 0}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}
