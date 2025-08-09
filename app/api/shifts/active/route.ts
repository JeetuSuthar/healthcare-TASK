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

    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: decoded.userId,
        clockOutTime: null,
      },
    })

    if (!activeShift) {
      return NextResponse.json(null)
    }

    return NextResponse.json(activeShift)
  } catch (error) {
    console.error('Get active shift error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
