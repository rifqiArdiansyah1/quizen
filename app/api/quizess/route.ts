import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { title, description, questions } = await request.json()

    // Validasi input
    if (!title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Title and questions are required' },
        { status: 400 }
      )
    }

    // Buat quiz baru beserta pertanyaan dan pilihan jawaban
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        questions: {
          create: questions.map((question: any) => ({
            text: question.text,
            choices: {
              create: question.choices.map((choice: any) => ({
                text: choice.text,
                isCorrect: choice.isCorrect || false
              }))
            }
          }))
        }
      },
      include: {
        questions: {
          include: {
            choices: true
          }
        }
      }
    })

    return NextResponse.json(newQuiz, { status: 201 })

  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const quizzes = await prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            choices: true
          }
        }
      }
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}