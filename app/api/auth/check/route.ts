import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET

export async function GET() {
    try {
        // Di route.ts check auth
        const cookieStore = cookies()
        const token = (await cookieStore).get('session_token')?.value

        if (!token) {
            return NextResponse.json({ isAuthenticated: false }, { status: 200 })
        }

        // Verifikasi token
        const decoded = jwt.verify(token, JWT_SECRET!) as { sub: string }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(decoded.sub) },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            }
        });

        return NextResponse.json({
            isAuthenticated: true,
            userId: user?.id,
            userName: user?.name,
            userImage: user?.image
        });
    } catch (error) {
        // Jika token tidak valid
        return NextResponse.json({ isAuthenticated: false }, { status: 200 })
    }
}