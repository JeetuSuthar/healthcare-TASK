import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const perimeter = await prisma.locationPerimeter.findFirst({
      where: { isActive: true },
    })

    return NextResponse.json(perimeter)
  } catch (error) {
    console.error('Get perimeter error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const { name, latitude, longitude, radius } = await request.json()

    // Deactivate existing perimeters
    await prisma.locationPerimeter.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    // Create new perimeter
    const perimeter = await prisma.locationPerimeter.create({
      data: {
        name,
        latitude,
        longitude,
        radius,
        isActive: true,
        createdBy: decoded.userId,
      },
    })

    return NextResponse.json(perimeter)
  } catch (error) {
    console.error('Set perimeter error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
