"use client"
import { Layout, Menu, Button, Avatar, Dropdown } from "antd"
import type React from "react"

import {
  DashboardOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
const { Header, Sider, Content } = Layout

export function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: "/worker/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/worker/history",
      icon: <HistoryOutlined />,
      label: "Shift History",
    },
  ]

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: logout,
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Header
        className="flex items-center justify-between px-6 shadow-sm bg-white" // Changed background to white, reduced shadow
        style={{
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <div className="flex items-center">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-700 hover:bg-gray-100 mr-4 lg:hidden" // Adjusted text and hover color
          />
          <div className="text-xl font-bold text-liefGreen-500">
            {" "}
            {/* Changed text color to liefGreen */}
            ShiftTracker
          </div>
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
          <Button
            type="text"
            className="flex items-center text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2" // Adjusted text and hover color
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ backgroundColor: "#00BFA5" }} // Changed avatar background to liefGreen
            />
            <span className="ml-2 hidden sm:inline">{user?.firstName || "User"}</span>
          </Button>
        </Dropdown>
      </Header>

      <Layout>
        <Sider
          width={220}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          className="shadow-lg"
          style={{
            background: "#ffffff",
            borderRight: "1px solid #f0f0f0",
          }}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="text-sm text-gray-500 font-medium">{collapsed ? "W" : "WORKER PANEL"}</div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            className="border-r-0 mt-2"
            style={{
              background: "transparent",
            }}
            theme="light"
          />
        </Sider>

        <Content
          className="m-6 p-6 rounded-lg shadow-sm"
          style={{
            background: "#ffffff",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          <div className="bg-gradient-to-r from-liefGreen-50 to-liefGreen-100 -m-6 mb-6 p-6 rounded-t-lg">
            {" "}
            {/* Changed gradient to liefGreen shades */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">Welcome back, {user?.firstName || "User"}!</h1>
            <p className="text-gray-600">Manage your shifts and track your work history</p>
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
