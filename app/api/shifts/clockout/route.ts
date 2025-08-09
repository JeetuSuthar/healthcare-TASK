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

    // Find active shift
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: decoded.userId,
        clockOutTime: null,
      },
    })

    if (!activeShift) {
      return NextResponse.json(
        { message: 'No active shift found' },
        { status: 400 }
      )
    }

    // Update shift with clock out information
    const updatedShift = await prisma.shift.update({
      where: { id: activeShift.id },
      data: {
        clockOutTime: new Date(),
        clockOutLatitude: latitude,
        clockOutLongitude: longitude,
        clockOutNote: note,
      },
    })

    return NextResponse.json(updatedShift)
  } catch (error) {
    console.error('Clock out error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
