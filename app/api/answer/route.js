import { NextResponse } from "next/server";

export async function POST(request){
    const data = await request.json();
    console.log('data yang diterima:', data)
    return NextResponse.json(
        { 
        message: "Data Berhasil Dikirim!" 
    },
    { status: 201 },
    )
}