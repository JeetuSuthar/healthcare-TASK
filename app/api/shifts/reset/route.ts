import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: string;
      role: string;
    }
    
    // Find any active shifts for this user
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: decoded.userId,
        clockOutTime: null,
      },
    })
    
    if (activeShift) {
      // Force clock out with a note
      const updatedShift = await prisma.shift.update({
        where: { id: activeShift.id },
        data: {
          clockOutTime: new Date(),
          clockOutNote: "Auto clock-out due to new login session",
        },
      })
      
      return NextResponse.json({
        success: true,
        message: "Previous shift was automatically clocked out",
        shift: updatedShift
      })
    }
    
    return NextResponse.json({
      success: false,
      message: "No active shift found to reset"
    })
    
  } catch (error) {
    console.error('Reset shift error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
