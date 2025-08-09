import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
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

    const activeStaff = await prisma.shift.findMany({
      where: {
        clockOutTime: null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        clockInTime: 'desc',
      },
    })

    return NextResponse.json(activeStaff)
  } catch (error) {
    console.error('Get active staff error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
