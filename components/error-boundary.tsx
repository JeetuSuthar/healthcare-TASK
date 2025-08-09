'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, Button, Typography, Space } from 'antd'
import { ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <Space direction="vertical" size="large" className="w-full">
              <ExclamationCircleOutlined className="text-6xl text-red-500" />
              
              <div>
                <Title level={3} className="text-red-600">
                  Something went wrong
                </Title>
                <Text type="secondary">
                  We encountered an unexpected error. Please try refreshing the page.
                </Text>
              </div>

              <div className="space-y-2">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={this.handleReset}
                  size="large"
                  block
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={() => window.location.reload()}
                  size="large"
                  block
                >
                  Refresh Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-600">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </Space>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
