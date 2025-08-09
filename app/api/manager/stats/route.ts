import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    interface JwtPayload {
      userId: string;
      role: string;
      exp?: number;
      iat?: number;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as JwtPayload
    
    // Verify manager role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || user.role !== 'MANAGER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Active staff count
    const activeStaff = await prisma.shift.count({
      where: {
        clockOutTime: null,
      },
    })

    // Today's completed shifts for average calculation
    const todayShifts = await prisma.shift.findMany({
      where: {
        clockInTime: { gte: today },
        clockOutTime: { not: null },
      },
    })

    const avgHoursToday = todayShifts.length > 0 
      ? todayShifts.reduce((sum: any, shift: any) => {
          const duration = new Date(shift.clockOutTime!).getTime() - new Date(shift.clockInTime).getTime()
          return sum + (duration / (1000 * 60 * 60))
        }, 0) / todayShifts.length
      : 0

    // Total clocked in today (including active)
    const totalClockedInToday = await prisma.shift.count({
      where: {
        clockInTime: { gte: today },
      },
    })

    // Total hours this week
    const weekShifts = await prisma.shift.findMany({
      where: {
        clockInTime: { gte: weekAgo },
        clockOutTime: { not: null },
      },
    })

    const totalHoursThisWeek = weekShifts.reduce((sum: any, shift: any) => {
      const duration = new Date(shift.clockOutTime!).getTime() - new Date(shift.clockInTime).getTime()
      return sum + (duration / (1000 * 60 * 60))
    }, 0)

    return NextResponse.json({
      activeStaff,
      avgHoursToday: Math.round(avgHoursToday * 10) / 10,
      totalClockedInToday,
      totalHoursThisWeek: Math.round(totalHoursThisWeek * 10) / 10,
    })
  } catch (error) {
    console.error('Get manager stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
