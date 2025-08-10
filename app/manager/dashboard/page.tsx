"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, Row, Col, Statistic, Typography, Button, Modal, Alert } from "antd"
import {
  UserOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  DashboardOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons"
import { ManagerLayout } from "@/components/layouts/manager-layout"
import { ActiveStaffTable } from "@/components/manager/active-staff-table"
import { ShiftAnalytics } from "@/components/manager/shift-analytics"
import { LocationSettings } from "@/components/manager/location-settings"
import { Loading } from "@/components/ui/loading"
const { Title, Text } = Typography

interface DashboardStats {
  activeStaff: number
  avgHoursToday: number
  totalClockedInToday: number
  totalHoursThisWeek: number
  totalStaff: number
  avgShiftDuration: number
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeStaff: 0,
    avgHoursToday: 0,
    totalClockedInToday: 0,
    totalHoursThisWeek: 0,
    totalStaff: 0,
    avgShiftDuration: 0,
  })
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/manager/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        throw new Error("Failed to fetch dashboard stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError("Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardStats])

  const openSettings = useCallback(() => {
    setSettingsVisible(true)
  }, [])

  const closeSettings = useCallback(() => {
    setSettingsVisible(false)
  }, [])

  const statCards = useMemo(
    () => [
      {
        title: "Currently Clocked In",
        value: stats.activeStaff,
        prefix: <UserOutlined />,
        valueStyle: { color: "#00BFA5" }, // liefGreen
        suffix: "",
        icon: <TeamOutlined className="text-2xl text-liefGreen-500" />, // liefGreen
      },
      {
        title: "Avg Hours Today",
        value: stats.avgHoursToday,
        prefix: <ClockCircleOutlined />,
        valueStyle: { color: "#00BFA5" }, // liefGreen
        suffix: "hrs",
        icon: <ClockCircleOutlined className="text-2xl text-liefGreen-500" />, // liefGreen
      },
      {
        title: "Total Clocked In Today",
        value: stats.totalClockedInToday,
        prefix: <BarChartOutlined />,
        valueStyle: { color: "#00BFA5" }, // liefGreen
        suffix: "",
        icon: <BarChartOutlined className="text-2xl text-liefGreen-500" />, // liefGreen
      },
      {
        title: "Total Hours This Week",
        value: stats.totalHoursThisWeek,
        prefix: <ClockCircleOutlined />,
        valueStyle: { color: "#00BFA5" }, // liefGreen
        suffix: "hrs",
        icon: <TrophyOutlined className="text-2xl text-liefGreen-500" />, // liefGreen
      },
    ],
    [stats],
  )

  if (loading) {
    return (
      <ManagerLayout>
        <Loading text="Loading dashboard..." fullScreen />
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Title level={2} className="mb-2 flex items-center text-gray-800">
              {" "}
              {/* Adjusted text color */}
              <DashboardOutlined className="mr-3 text-liefGreen-500" /> {/* Adjusted icon color */}
              Manager Dashboard
            </Title>
            <Text type="secondary" className="text-gray-600">
              {" "}
              {/* Adjusted text color */}
              Monitor your team's activity and performance in real-time
            </Text>
          </div>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={openSettings}
            size="large"
            style={{ backgroundColor: "#00BFA5", borderColor: "#00BFA5" }} // liefGreen
          >
            Location Settings
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            className="mb-6"
            action={
              <Button size="small" onClick={fetchDashboardStats}>
                Retry
              </Button>
            }
          />
        )}

        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          {statCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      valueStyle={stat.valueStyle}
                      precision={stat.suffix === "hrs" ? 1 : 0}
                    />
                  </div>
                  <div className="ml-4">{stat.icon}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Additional Stats Row */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12}>
            <Card className="h-full shadow-lg">
              <Statistic
                title="Total Staff Members"
                value={stats.totalStaff}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#00BFA5" }} // liefGreen
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="h-full shadow-lg">
              <Statistic
                title="Average Shift Duration"
                value={stats.avgShiftDuration}
                suffix="hrs"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#00BFA5" }} // liefGreen
                precision={1}
              />
            </Card>
          </Col>
        </Row>

        {/* Active Staff Table */}
        <Card
          title={
            <div className="flex items-center text-gray-800">
              {" "}
              {/* Adjusted text color */}
              <TeamOutlined className="mr-2 text-liefGreen-500" /> {/* Adjusted icon color */}
              Currently Active Staff
            </div>
          }
          className="mb-8 shadow-lg"
        >
          <ActiveStaffTable />
        </Card>

        {/* Analytics */}
        <Card
          title={
            <div className="flex items-center text-gray-800">
              {" "}
              {/* Adjusted text color */}
              <BarChartOutlined className="mr-2 text-liefGreen-500" /> {/* Adjusted icon color */}
              Shift Analytics
            </div>
          }
          className="shadow-lg"
        >
          <ShiftAnalytics />
        </Card>

        {/* Location Settings Modal */}
        <Modal
          title={
            <div className="flex items-center text-gray-800">
              {" "}
              {/* Adjusted text color */}
              <SettingOutlined className="mr-2" />
              Location Settings
            </div>
          }
          open={settingsVisible}
          onCancel={closeSettings}
          footer={null}
          width={800}
          destroyOnClose
        >
          <LocationSettings onClose={closeSettings} />
        </Modal>
      </div>
    </ManagerLayout>
  )
}
