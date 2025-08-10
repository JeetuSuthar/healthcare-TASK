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
    const { latitude, longitude, note } = await request.json()

    // Check if user already has an active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: decoded.userId,
        clockOutTime: null,
      },
    })

    if (activeShift) {
      return NextResponse.json(
        { 
          message: 'You already have an active shift',
          existingShift: activeShift 
        },
        { status: 400 }
      )
    }

    // Verify location is within perimeter (optional - only if perimeter exists)
    const perimeter = await prisma.locationPerimeter.findFirst({
      where: { isActive: true },
    })

    if (perimeter) {
      const distance = calculateDistance(latitude, longitude, perimeter.latitude, perimeter.longitude)
      if (distance > perimeter.radius) {
        return NextResponse.json(
          { message: 'You are outside the designated area' },
          { status: 400 }
        )
      }
    }

    // Create new shift
    const shift = await prisma.shift.create({
      data: {
        userId: decoded.userId,
        clockInTime: new Date(),
        clockInLatitude: latitude,
        clockInLongitude: longitude,
        clockInNote: note,
      },
    })

    return NextResponse.json({ 
      success: true, 
      shift: shift 
    })
  } catch (error) {
    console.error('Clock in error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}