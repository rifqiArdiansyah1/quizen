import { NextResponse } from "next/server";
const users = [
    { id: '1', name: 'Budi', email: 'budi@example.com' },
    { id: '2', name: 'Siti', email: 'siti@example.com' },
    { id: '3', name: 'Joko', email: 'joko@example.com' },
];

export async function GET(request, { params }) {
    const { id   } = params;
    const user = users.find((u) => u.id == id);
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: "404" })
    }
    return NextResponse.json(user)
}