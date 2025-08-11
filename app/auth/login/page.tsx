'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Button, Typography, Divider, message, Space } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined, MailOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/use-auth'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle, user } = useAuth()
  const router = useRouter()

  // Watch for user changes and redirect accordingly
  useEffect(() => {
    if (user && !loading) {
      redirectBasedOnRole(user.role)
    }
  }, [user, loading])

  const redirectBasedOnRole = (userRole: string) => {
    console.log('Redirecting user with role:', userRole) // Debug log
    
    if (userRole === 'MANAGER') {
      router.push('/manager/dashboard')
    } else if (userRole === 'WORKER') {
      router.push('/worker/dashboard')
    } else {
      console.warn('Unknown role:', userRole)
      router.push('/')
    }
  }

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      await login(values.email, values.password)
      message.success('Login successful!')
      // Redirection will be handled by useEffect when user state updates
    } catch (error) {
      message.error('Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      message.success('Google login successful!')
      // Redirection will be handled by useEffect when user state updates
    } catch (error) {
      message.error('Google login failed.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2} className="text-blue-600">ShiftTracker</Title>
          <Text type="secondary">Healthcare Worker Management</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>Or</Divider>

        <Space direction="vertical" className="w-full">
          <Button
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
            className="w-full"
            size="large"
            loading={loading}
          >
            Continue with Google
          </Button>
        </Space>

        <div className="text-center mt-6">
          <Text type="secondary">
            {"Don't have an account? "}
            <Button type="link" onClick={() => router.push('/auth/register')} className="p-0">
              Sign up
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  )
}