// app/api/quizzes/[quizId]/submit/route.js

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const { quizId } = params;
    
    // 1. Ambil data dari body request yang dikirim frontend
    // Strukturnya akan seperti: { userId: 1, answers: { 'questionId': 'choiceId', ... } }
    const body = await request.json();
    const { userId, answers } = body;

    // --- CATATAN PENTING KEAMANAN ---
    // Di aplikasi nyata, `userId` tidak boleh diambil dari body request karena tidak aman.
    // Seharusnya Anda mendapatkan `userId` dari sesi otentikasi (misalnya menggunakan NextAuth.js).
    // Untuk tujuan belajar, kita akan gunakan dari body terlebih dahulu.

    if (!userId || !answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ message: 'User ID dan jawaban diperlukan' }, { status: 400 });
    }

    // 2. Ambil kunci jawaban yang benar dari database untuk kuis ini
    const correctAnswers = await prisma.question.findMany({
      where: {
        quizId: parseInt(quizId),
      },
      select: {
        id: true, // ID pertanyaan
        choices: {
          where: { isCorrect: true }, // Hanya ambil pilihan yang benar
          select: {
            id: true, // ID pilihan yang benar
          },
        },
      },
    });

    // 3. Ubah format kunci jawaban agar mudah dicari
    const correctChoiceMap = correctAnswers.reduce((map, question) => {
      // Pastikan ada pilihan yang benar untuk pertanyaan ini
      if (question.choices.length > 0) {
        map[question.id] = question.choices[0].id;
      }
      return map;
    }, {});

    // 4. Hitung skor
    let score = 0;
    for (const questionId in answers) {
      const userChoiceId = answers[questionId];
      // Cek apakah jawaban user sama dengan kunci jawaban
      if (correctChoiceMap[questionId] === userChoiceId) {
        score++;
      }
    }

    const totalQuestions = correctAnswers.length;
    const finalScore = Math.round((score / totalQuestions) * 100);

    // 5. Simpan hasil pengerjaan kuis ke database
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        score: finalScore,
        userId: userId,
        quizId: parseInt(quizId),
      },
    });

    // 6. Kembalikan skor akhir ke frontend
    return NextResponse.json({
      message: 'Kuis berhasil diselesaikan!',
      score: finalScore,
      attemptId: quizAttempt.id,
    });

  } catch (error) {
    console.error('Gagal submit kuis:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}