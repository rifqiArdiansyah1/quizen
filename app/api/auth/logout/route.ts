import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        (await cookies()).delete('session_token')
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        )
    }
}