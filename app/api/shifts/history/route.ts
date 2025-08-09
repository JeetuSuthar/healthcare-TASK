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

    const shifts = await prisma.shift.findMany({
      where: { userId: decoded.userId },
      orderBy: { clockInTime: 'desc' },
      take: 50,
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Get shift history error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
