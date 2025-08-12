"use client"
import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useState, useRef, useEffect } from "react"

// Icons as SVG components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14H8V5z" />
  </svg>
)

const TeamIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UserIcon2 = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogoutIcon2 = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const MenuIcon2 = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon2 = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
  </svg>
)

const ChevronDownIcon2 = ({ isOpen }: { isOpen: boolean }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const menuItems = [
    {
      key: "/manager/dashboard",
      icon: <DashboardIcon />,
      label: "Dashboard",
    },
    {
      key: "/manager/staff",
      icon: <TeamIcon />,
      label: "Staff Management",
    },
    {
      key: "/manager/analytics",
      icon: <AnalyticsIcon />,
      label: "Analytics",
    },
    {
      key: "/manager/settings",
      icon: <SettingsIcon />,
      label: "Settings",
    },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsDropdownOpen(false)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleProfile = () => {
    setIsDropdownOpen(false)
    router.push('/manager/profile')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isSidebarOpen ? <CloseIcon2 /> : <MenuIcon2 />}
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ShiftTracker Manager
            </h1>
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                {user?.firstName?.[0] || 'M'}
              </div>
              <span className="hidden sm:block font-medium text-gray-800">
                {user?.firstName || "Manager"}
              </span>
              <ChevronDownIcon2 isOpen={isDropdownOpen} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[60] animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={handleProfile}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150"
                >
                  <UserIcon2 />
                  <span>Profile</span>
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-150"
                >
                  <LogoutIcon2 />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40
          w-64 max-w-full bg-white shadow-lg border-r border-gray-200
          transition-transform duration-300 ease-in-out
          flex flex-col
        `} aria-label="Manager sidebar navigation">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Manager Panel
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              <CloseIcon2 />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    router.push(item.key)
                    setIsSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-4 sm:p-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-5 sm:p-6 mb-6 text-white shadow-lg overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                Welcome, {user?.firstName || "Manager"}! 📊
              </h2>
              <p className="text-blue-100 opacity-90 text-sm sm:text-base">
                Manage your team, track performance, and oversee operations
              </p>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-280px)] p-3 sm:p-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}