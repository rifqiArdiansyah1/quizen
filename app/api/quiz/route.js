import { NextResponse } from "next/server"

export async function GET(request) {
    const data = { question: "Apakah kamu laki-laki?"}
    return NextResponse.json({data})
}