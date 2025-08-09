'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Form, Input, Button, Typography, Select, message, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/use-auth'

const { Title, Text } = Typography
const { Option } = Select

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const onFinish = async (values: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'WORKER' | 'MANAGER'
  }) => {
    setLoading(true)
    try {
      await register(values)
      message.success('Registration successful!')
      router.push('/')
    } catch (error) {
      message.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Title level={2} className="text-blue-600">Join ShiftTracker</Title>
          <Text type="secondary">Create your account</Text>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Space.Compact className="w-full">
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: 'First name required!' }]}
              className="w-1/2"
            >
              <Input placeholder="First Name" />
            </Form.Item>
            <Form.Item
              name="lastName"
              rules={[{ required: true, message: 'Last name required!' }]}
              className="w-1/2"
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          </Space.Compact>

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
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Please select your role!' }]}
          >
            <Select
              placeholder="Select your role"
              prefix={<TeamOutlined />}
            >
              <Option value="WORKER">Healthcare Worker</Option>
              <Option value="MANAGER">Manager</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              loading={loading}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <Text type="secondary">
            Already have an account?{' '}
            <Button type="link" onClick={() => router.push('/auth/login')} className="p-0">
              Sign in
            </Button>
          </Text>
        </div>
      </Card>
    </div>
  )
}
