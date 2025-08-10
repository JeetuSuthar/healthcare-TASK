import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') 

    const activeShift = await prisma.shift.findFirst({
      where: {
        //@ts-ignore
        userId: decoded.userId,
        clockOutTime: null,
      },
    })

    // Return null explicitly if no active shift
    return NextResponse.json(activeShift || null)
  } catch (error) {
    console.error('Get active shift error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}


