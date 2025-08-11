'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'WORKER' | 'MANAGER'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store'
      })
      if (response.ok) {
        const userData = await response.json()
        console.log('Auth check - user data:', userData) // Debug log
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store'
      })
      if (response.ok) {
        const userData = await response.json()
        console.log('Refresh user - user data:', userData) // Debug log
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('User refresh failed:', error)
      setUser(null)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error('Login failed')
    }

    // Don't set user from login response - fetch fresh data instead
    // This ensures we get the most up-to-date user data
    await refreshUser()
  }

  const register = async (userData: any) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error('Registration failed')
    }

    // Don't set user from register response - fetch fresh data instead
    await refreshUser()
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Clear any cached data
      localStorage.clear()
      sessionStorage.clear()
      
      // Force reload to clear any cached state
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
      setUser(null)
      window.location.href = '/auth/login'
    }
  }

  const loginWithGoogle = async () => {
    // Implement Google OAuth flow
    window.location.href = '/api/auth/google'
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      loginWithGoogle,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}