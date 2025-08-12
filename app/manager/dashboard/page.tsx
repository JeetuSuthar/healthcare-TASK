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
        mobileTitle: "Active Staff",
        value: stats.activeStaff,
        prefix: <UserOutlined />,
        valueStyle: { color: "#00BFA5" },
        suffix: "",
        icon: <TeamOutlined className="text-lg sm:text-2xl text-liefGreen-500" />,
      },
      {
        title: "Avg Hours Today",
        mobileTitle: "Hours Today",
        value: stats.avgHoursToday,
        prefix: <ClockCircleOutlined />,
        valueStyle: { color: "#00BFA5" },
        suffix: "hrs",
        icon: <ClockCircleOutlined className="text-lg sm:text-2xl text-liefGreen-500" />,
      },
      {
        title: "Total Clocked In Today",
        mobileTitle: "Total Today",
        value: stats.totalClockedInToday,
        prefix: <BarChartOutlined />,
        valueStyle: { color: "#00BFA5" },
        suffix: "",
        icon: <BarChartOutlined className="text-lg sm:text-2xl text-liefGreen-500" />,
      },
      {
        title: "Total Hours This Week",
        mobileTitle: "Week Hours",
        value: stats.totalHoursThisWeek,
        prefix: <ClockCircleOutlined />,
        valueStyle: { color: "#00BFA5" },
        suffix: "hrs",
        icon: <TrophyOutlined className="text-lg sm:text-2xl text-liefGreen-500" />,
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
      <div className="w-full max-w-full overflow-hidden">
        <div className="p-2 sm:p-4 md:p-6 w-full max-w-full">
          {/* Header */}
          <header className="mb-4 sm:mb-6 w-full">
            <div className="w-full min-w-0">
              <Title level={2} className="mb-1 sm:mb-2 flex items-center text-gray-800 text-base sm:text-xl md:text-2xl">
                <DashboardOutlined className="mr-2 text-liefGreen-500 flex-shrink-0 text-base sm:text-xl" />
                <span className="truncate">
                  <span className="sm:hidden">Dashboard</span>
                  <span className="hidden sm:inline">Manager Dashboard</span>
                </span>
              </Title>
              <Text type="secondary" className="block text-xs sm:text-sm text-gray-600">
                <span className="sm:hidden">Monitor team activity</span>
                <span className="hidden sm:inline">Monitor your team's activity & performance</span>
              </Text>
            </div>
            <div className="mt-2 w-full">
              <Button
                type="primary"
                icon={<SettingOutlined />}
                onClick={openSettings}
                size="small"
                className="w-full sm:w-auto text-xs"
                style={{ backgroundColor: "#00BFA5", borderColor: "#00BFA5" }}
              >
                Settings
              </Button>
            </div>
          </header>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-4 sm:mb-6"
              action={
                <Button size="small" onClick={fetchDashboardStats}>
                  Retry
                </Button>
              }
            />
          )}

          {/* Stats Cards - Mobile: 2x2 Grid */}
          <Row gutter={[4, 4]} className="mb-4 sm:mb-6">
            {statCards.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card className="h-full shadow-sm" bodyStyle={{ padding: '6px' }}>
                  <div className="w-full min-w-0">
                    <div className="text-[9px] sm:text-xs text-gray-500 mb-1 truncate">
                      <span className="sm:hidden">{stat.mobileTitle}</span>
                      <span className="hidden sm:inline">{stat.title}</span>
                    </div>
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <span className="text-xs sm:hidden text-liefGreen-500">{stat.prefix}</span>
                        <span 
                          className="text-sm sm:text-lg font-semibold truncate"
                          style={stat.valueStyle}
                        >
                          {stat.suffix === "hrs" ? (stat.value || 0).toFixed(1) : (stat.value || 0)}
                        </span>
                        <span className="text-[9px] sm:text-xs text-gray-400 flex-shrink-0">{stat.suffix}</span>
                      </div>
                      <div className="hidden sm:block ml-1 flex-shrink-0">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Additional Stats Row */}
          <Row gutter={[4, 4]} className="mb-4 sm:mb-6">
            <Col xs={24} sm={12}>
              <Card className="h-full shadow-sm" bodyStyle={{ padding: '6px' }}>
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] sm:text-xs text-gray-500 mb-1 truncate">
                      <span className="sm:hidden">Total Staff</span>
                      <span className="hidden sm:inline">Total Staff Members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:hidden text-liefGreen-500"><UserOutlined /></span>
                      <span 
                        className="text-sm sm:text-lg font-semibold"
                        style={{ color: "#00BFA5" }}
                      >
                        {stats.totalStaff || 0}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block ml-1 flex-shrink-0">
                    <UserOutlined className="text-lg text-liefGreen-500" />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className="h-full shadow-sm" bodyStyle={{ padding: '6px' }}>
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] sm:text-xs text-gray-500 mb-1 truncate">
                      <span className="sm:hidden">Avg Duration</span>
                      <span className="hidden sm:inline">Average Shift Duration</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:hidden text-liefGreen-500"><ClockCircleOutlined /></span>
                      <span 
                        className="text-sm sm:text-lg font-semibold"
                        style={{ color: "#00BFA5" }}
                      >
                        {(stats.avgShiftDuration || 0).toFixed(1)}
                      </span>
                      <span className="text-[9px] sm:text-xs text-gray-400">hrs</span>
                    </div>
                  </div>
                  <div className="hidden sm:block ml-1 flex-shrink-0">
                    <ClockCircleOutlined className="text-lg text-liefGreen-500" />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Active Staff Table */}
          <Card
            title={
              <div className="flex items-center text-gray-800">
                <TeamOutlined className="mr-1 text-liefGreen-500 text-sm" />
                <span className="truncate text-sm">
                  <span className="sm:hidden">Active Staff</span>
                  <span className="hidden sm:inline">Currently Active Staff</span>
                </span>
              </div>
            }
            className="mb-4 sm:mb-6 shadow-sm"
            bodyStyle={{ padding: "0" }}
            headStyle={{ padding: "8px 12px" }}
          >
            <div className="overflow-x-auto">
              <ActiveStaffTable />
            </div>
          </Card>

          {/* Analytics */}
          <Card
            title={
              <div className="flex items-center text-gray-800">
                <BarChartOutlined className="mr-1 text-liefGreen-500 text-sm" />
                <span className="truncate text-sm">
                  <span className="sm:hidden">Analytics</span>
                  <span className="hidden sm:inline">Shift Analytics</span>
                </span>
              </div>
            }
            className="shadow-sm"
            bodyStyle={{ padding: "0" }}
            headStyle={{ padding: "8px 12px" }}
          >
            <div className="overflow-x-auto">
              <ShiftAnalytics />
            </div>
          </Card>

          {/* Location Settings Modal */}
          <Modal
            title={
              <div className="flex items-center text-gray-800">
                <SettingOutlined className="mr-2" />
                Location Settings
              </div>
            }
            open={settingsVisible}
            onCancel={closeSettings}
            footer={null}
            width="95%"
            style={{ maxWidth: '800px' }}
            rootClassName="manager-settings-modal"
            destroyOnClose
          >
            <LocationSettings onClose={closeSettings} />
          </Modal>
        </div>
      </div>
    </ManagerLayout>
  )
}