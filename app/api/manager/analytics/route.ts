import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
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

    const { startDate, endDate, viewType } = await request.json()

    // Get shifts in date range
    const shifts = await prisma.shift.findMany({
      where: {
        clockInTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        clockOutTime: { not: null },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Process data for charts
    const dailyHours = processShiftsForDailyHours(shifts, viewType)
    const staffHours = processShiftsForStaffHours(shifts)
    const shiftDistribution = processShiftsForDistribution(shifts)

    // Calculate summary stats
    const avgShiftDuration = shifts.length > 0 
      ? shifts.reduce((sum: number, shift: { clockOutTime: Date | string | null; clockInTime: Date | string }) => {
          if (!shift.clockOutTime) return sum;
          const duration = new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime()
          return sum + (duration / (1000 * 60 * 60))
        }, 0) / shifts.length
      : 0

    return NextResponse.json({
      dailyHours,
      staffHours,
      shiftDistribution,
      avgShiftDuration: Math.round(avgShiftDuration * 10) / 10,
      totalShifts: shifts.length,
    })
  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface Shift {
  clockInTime: Date | string;
  clockOutTime: Date | string | null;
  user: {
    firstName: string;
    lastName: string;
  };
}

function processShiftsForDailyHours(shifts: Shift[], viewType: string) {
  if (viewType === 'weekly') {
    // Group by week number (ISO week)
    const weekData: { [key: string]: number } = {}
    shifts.forEach(shift => {
      if (!shift.clockOutTime) return;
      const d = new Date(shift.clockInTime)
      // Get ISO week string: YYYY-Www
      const year = d.getUTCFullYear()
      const week = getISOWeek(d)
      const weekKey = `${year}-W${week.toString().padStart(2, '0')}`
      const clockOutDate = new Date(shift.clockOutTime)
      const clockInDate = new Date(shift.clockInTime)
      const duration = (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60)
      if (!weekData[weekKey]) weekData[weekKey] = 0
      weekData[weekKey] += duration
    })
    return Object.entries(weekData).map(([week, hours]) => ({
      date: week,
      hours: Math.round(hours * 10) / 10,
    }))
  } else {
    // Default: group by day
    const dailyData: { [key: string]: number } = {}
    shifts.forEach(shift => {
      if (!shift.clockOutTime) return;
      const date = new Date(shift.clockInTime).toISOString().split('T')[0]
      const clockOutDate = new Date(shift.clockOutTime)
      const clockInDate = new Date(shift.clockInTime)
      const duration = (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60)
      if (!dailyData[date]) dailyData[date] = 0
      dailyData[date] += duration
    })
    return Object.entries(dailyData).map(([date, hours]) => ({
      date,
      hours: Math.round(hours * 10) / 10,
    }))
  }
}

// Helper: ISO week number
function getISOWeek(date: Date) {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(),0,1))
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function processShiftsForStaffHours(shifts: Shift[]) {
  const staffData: { [key: string]: number } = {}
  
  shifts.forEach(shift => {
    if (!shift.clockOutTime) return;
    const staffName = `${shift.user.firstName} ${shift.user.lastName}`
    const clockOutDate = new Date(shift.clockOutTime)
    const clockInDate = new Date(shift.clockInTime)
    const duration = (clockOutDate.getTime() - clockInDate.getTime()) / (1000 * 60 * 60)
    
    if (!staffData[staffName]) {
      staffData[staffName] = 0
    }
    staffData[staffName] += duration
  })

  return Object.entries(staffData).map(([staff, hours]) => ({
    staff,
    hours: Math.round(hours * 10) / 10,
  }))
}

function processShiftsForDistribution(shifts: Shift[]) {
  const morningShifts = shifts.filter(shift => {
    const hour = new Date(shift.clockInTime).getHours()
    return hour >= 6 && hour < 14
  }).length

  const afternoonShifts = shifts.filter(shift => {
    const hour = new Date(shift.clockInTime).getHours()
    return hour >= 14 && hour < 22
  }).length

  const nightShifts = shifts.filter(shift => {
    const hour = new Date(shift.clockInTime).getHours()
    return hour >= 22 || hour < 6
  }).length

  return [
    { type: 'Morning (6AM-2PM)', value: morningShifts },
    { type: 'Afternoon (2PM-10PM)', value: afternoonShifts },
    { type: 'Night (10PM-6AM)', value: nightShifts },
  ]
}
