import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('session_token')?.value
    const protectedRoutes = ['/dashboard', '/quiz', '/profile']
    const authRoutes = ['/login', '/register']

    // Jika mencoba akses route protected tanpa token
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
            return NextResponse.next()
        } catch (error) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Jika sudah login tapi mencoba akses auth route
    if (authRoutes.includes(request.nextUrl.pathname)) {
        if (token) {
            try {
                await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
                return NextResponse.redirect(new URL('/dashboard', request.url))
            } catch (error) {
                return NextResponse.next()
            }
        }
    }

    return NextResponse.next()
}