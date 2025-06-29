import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 10000, // tunggu max 10 detik sebelum error
    timeout: 15000  // batasi lama transaksi maksimum 15 detik
  }
})

export async function GET(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = parseInt(params.quizId)

    // Validasi ID quiz
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID format' },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true
          },
          orderBy: {
            id: 'asc' // Urutkan pertanyaan secara konsisten
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Jangan kembalikan field yang tidak perlu
    // Langsung kembalikan quiz karena tidak ada field password
    return NextResponse.json(quiz)
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: Request, { params }: { params: { quizId: string } }) {
  try {
    // Validasi ID quiz
    const quizId = Number(params.quizId)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid quiz ID' },
        { status: 400 }
      )
    }

    // Validasi data input
    const { title, description, questions } = await request.json()
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Title is required and must be a string' },
        { status: 400 }
      )
    }

    // Mulai transaksi
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update data quiz utama
      await tx.quiz.update({
        where: { id: quizId },
        data: {
          title,
          description: description || null,
          updatedAt: new Date() // Pastikan updatedAt diperbarui
        }
      })

      // 2. Hapus semua pertanyaan dan pilihan jawaban lama
      await tx.choice.deleteMany({
        where: {
          question: {
            quizId
          }
        }
      })
      await tx.question.deleteMany({
        where: { quizId }
      })

      // 3. Buat pertanyaan dan pilihan jawaban baru
      for (const question of questions) {
        await tx.question.create({
          data: {
            text: question.text,
            quizId,
            choices: {
              create: question.choices.map((choice: any) => ({
                text: choice.text,
                isCorrect: choice.isCorrect || false
              }))
            }
          }
        })
      }

      // 4. Ambil data terbaru untuk dikembalikan
      return await tx.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            include: {
              choices: true
            }
          }
        }
      })
    })

    return NextResponse.json({ success: true, data: result })
    
  } catch (error: any) {
    console.error('Error updating quiz:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update quiz',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = parseInt(params.quizId)

    // Validasi ID quiz
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID format' },
        { status: 400 }
      )
    }

    // Cek apakah quiz ada sebelum menghapus
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId }
    })

    if (!existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Hapus quiz (dengan cascade ke questions dan choices)
    await prisma.quiz.delete({
      where: { id: quizId }
    })

    return NextResponse.json(
      { success: true, message: 'Quiz deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}