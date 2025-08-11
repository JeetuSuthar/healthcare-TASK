'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Button, Typography, Divider, message, Space } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined, MailOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/use-auth'

const { Title, Text } = Typography

export default function LoginPage() {
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, loginWithGoogle, user, refreshUser } = useAuth()
  const router = useRouter()

  // Watch for user changes and redirect accordingly
  useEffect(() => {
    if (!user) return
    const id = setTimeout(() => {
      // Redirect as soon as we have a user; loading is allowed to be false or true
      redirectBasedOnRole(user.role)
    }, 0)
    return () => clearTimeout(id)
  }, [user])

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
    setEmailLoading(true)
    try {
      await login(values.email, values.password)
      // Ensure freshest user data, then allow effect to run
      await refreshUser()
      message.success('Login successful!')
      // Important: let loading be false so useEffect can redirect
      setEmailLoading(false)
      // Fallback: if user is already available, redirect immediately
      if (user) {
        redirectBasedOnRole(user.role)
      }
    } catch (error) {
      message.error('Login failed. Please check your credentials.')
      setEmailLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      message.success('Google login successful!')
  // For OAuth, the browser navigates away; as a fallback, drop loading
  setGoogleLoading(false)
    } catch (error) {
      message.error('Google login failed.')
      setGoogleLoading(false)
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
              loading={emailLoading}
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
            loading={googleLoading}
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