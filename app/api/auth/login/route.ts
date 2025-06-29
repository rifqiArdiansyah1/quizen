import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validasi input lebih ketat
    if (!email || !email.includes('@') || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Email dan password harus valid' },
        { status: 400 }
      )
    }

    // Cari user di database dengan case-insensitive
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        createdAt: true
      }
    })

    // Pesan error yang sama untuk mencegah user enumeration
    if (!user || !user.password) {
      await bcrypt.compare(password, '$2a$10$fakehashforsecurity') // Fake comparison untuk timing attack
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Verifikasi password dengan timing-safe comparison
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Generate JWT token dengan data minimal
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      JWT_SECRET!,
      {
        expiresIn: '1d',
        algorithm: 'HS256'
      }
    )

    // Set HttpOnly cookie dengan Secure dan SameSite
    ;(await
      // Set HttpOnly cookie dengan Secure dan SameSite
      cookies()).set({
      name: 'session_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/',
      sameSite: 'strict',
    })

    // Jangan kembalikan password dan field sensitif
    const { password: _, ...safeUser } = user

    return NextResponse.json(
      {
        success: true,
        user: safeUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}