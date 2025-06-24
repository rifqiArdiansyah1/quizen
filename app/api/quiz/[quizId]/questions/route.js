// app/api/quizzes/[quizId]/questions/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    // 1. Ambil quizId dari parameter URL dan ubah menjadi angka
    const quizId = parseInt(params.quizId, 10);

    // Validasi sederhana jika quizId bukan angka
    if (isNaN(quizId)) {
      return NextResponse.json({ message: 'Quiz ID tidak valid' }, { status: 400 });
    }

    // 2. Gunakan Prisma untuk mencari semua pertanyaan yang memiliki quizId yang sesuai.
    // Kita gunakan `include` untuk secara otomatis mengambil data `choices` yang berelasi.
    const questions = await prisma.question.findMany({
      where: {
        quizId: quizId,
      },
      include: {
        // Ini adalah fitur powerful dari Prisma.
        // Secara otomatis akan mengambil semua 'pilihan' yang terhubung dengan setiap 'pertanyaan'.
        choices: {
          select: {
            id: true,
            text: true,
            // Kita tidak perlu mengirim 'isCorrect' ke frontend saat kuis berlangsung
          }
        },
      },
    });

    // Jika tidak ada pertanyaan yang ditemukan
    if (questions.length === 0) {
      return NextResponse.json({ message: 'Tidak ada pertanyaan ditemukan untuk kuis ini' }, { status: 404 });
    }

    // 3. Kembalikan data pertanyaan dalam format JSON
    return NextResponse.json(questions);

  } catch (error) {
    console.error('Gagal mengambil pertanyaan:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}