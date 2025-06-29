import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Verifikasi token dari cookie
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verifikasi dan decode token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { sub: string }
    const authenticatedUserId = parseInt(decoded.sub)

    // Pastikan user hanya mengakses profil sendiri
    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only access your own profile' },
        { status: 403 }
      )
    }

    // Ambil data user beserta quiz attempts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quizAttempts: {
          include: {
            quiz: {
              include: {
                questions: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Jangan kembalikan password
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user data:', error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    // Verifikasi token
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET as string) as { sub: string }
    const authenticatedUserId = parseInt(decoded.sub)

    // Pastikan user hanya mengupdate profil sendiri
    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You can only update your own profile' },
        { status: 403 }
      )
    }

    const { name, email, currentPassword, newPassword } = await request.json()

    // Validasi input
    if (!name && !email && !newPassword) {
      return NextResponse.json(
        { error: 'At least one field (name, email, or password) must be provided' },
        { status: 400 }
      )
    }

    // Ambil user dari database
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Jika update password, verifikasi password lama
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      if (!user.password) {
        return NextResponse.json(
          { error: 'Password change not allowed for this account' },
          { status: 403 }
        )
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
    }

    // Hash password baru jika ada
    const hashedPassword = newPassword
      ? await bcrypt.hash(newPassword, 12)
      : undefined

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword || user.password
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}