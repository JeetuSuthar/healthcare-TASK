import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
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
      ? shifts.reduce((sum:any, shift:any) => {
          const duration = new Date(shift.clockOutTime!).getTime() - new Date(shift.clockInTime).getTime()
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

function processShiftsForDailyHours(shifts: any[], viewType: string) {
  const dailyData: { [key: string]: number } = {}
  
  shifts.forEach(shift => {
    const date = new Date(shift.clockInTime).toISOString().split('T')[0]
    const duration = (new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime()) / (1000 * 60 * 60)
    
    if (!dailyData[date]) {
      dailyData[date] = 0
    }
    dailyData[date] += duration
  })

  return Object.entries(dailyData).map(([date, hours]) => ({
    date,
    hours: Math.round(hours * 10) / 10,
  }))
}

function processShiftsForStaffHours(shifts: any[]) {
  const staffData: { [key: string]: number } = {}
  
  shifts.forEach(shift => {
    const staffName = `${shift.user.firstName} ${shift.user.lastName}`
    const duration = (new Date(shift.clockOutTime).getTime() - new Date(shift.clockInTime).getTime()) / (1000 * 60 * 60)
    
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

function processShiftsForDistribution(shifts: any[]) {
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
