'use client'

import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import { DashboardOutlined, TeamOutlined, BarChartOutlined, SettingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

const { Header, Sider, Content } = Layout

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      key: '/manager/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/manager/staff',
      icon: <TeamOutlined />,
      label: 'Staff Management',
    },
    {
      key: '/manager/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/manager/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-white shadow-sm px-6">
        <div className="text-xl font-bold text-blue-600">
          ShiftTracker Manager
        </div>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Button type="text" className="flex items-center">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="ml-2">{user?.firstName}</span>
          </Button>
        </Dropdown>
      </Header>
      
      <Layout>
        <Sider 
          width={200} 
          className="bg-white shadow-sm"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            className="h-full border-r-0"
          />
        </Sider>
        
        <Content className="bg-gray-50">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
