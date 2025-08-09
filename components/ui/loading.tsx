'use client'

import { Spin, Typography, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

interface LoadingProps {
  text?: string
  size?: 'small' | 'default' | 'large'
  fullScreen?: boolean
  className?: string
}

export function Loading({ 
  text = 'Loading...', 
  size = 'large', 
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

  const content = (
    <Space direction="vertical" align="center" size="middle">
      <Spin indicator={antIcon} size={size} />
      <Text type="secondary">{text}</Text>
    </Space>
  )

  if (fullScreen) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${className}`}>
        {content}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      {content}
    </div>
  )
}

export function PageLoading() {
  return <Loading text="Loading page..." fullScreen />
}

export function DataLoading() {
  return <Loading text="Loading data..." />
}

export function ActionLoading() {
  return <Loading text="Processing..." size="default" />
}
