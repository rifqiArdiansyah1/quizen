import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

export async function POST(request: Request) {
  try {
    // Verifikasi user dari session token
    const token = (await cookies()).get('session_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login first' },
        { status: 401 }
      )
    }

    // Decode token untuk mendapatkan user ID
    const decoded = jwt.verify(token, JWT_SECRET as string) as { sub: string }
    const userId = parseInt(decoded.sub)

    const { quizId, answers } = await request.json()

    // Validasi input
    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'quizId and answers array are required' },
        { status: 400 }
      )
    }

    // Hitung skor
    const correctAnswers = await prisma.choice.findMany({
      where: {
        questionId: { in: answers.map((a: any) => a.questionId) },
        isCorrect: true
      },
      select: {
        id: true,
        questionId: true
      }
    })

    const correctAnswerMap = new Map()
    correctAnswers.forEach(answer => {
      correctAnswerMap.set(answer.questionId, answer.id)
    })

    let score = 0
    answers.forEach((answer: any) => {
      const correctChoiceId = correctAnswerMap.get(answer.questionId)
      if (correctChoiceId === answer.choiceId) {
        score++
      }
    })

    // Simpan attempt ke database
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId, // Gunakan userId dari session token
        quizId: parseInt(quizId),
        score
      },
      include: {
        quiz: {
          select: {
            title: true,
            _count: {
              select: { questions: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      score,
      totalQuestions: quizAttempt.quiz._count.questions,
      attemptId: quizAttempt.id,
      quizTitle: quizAttempt.quiz.title
    })
  } catch (error) {
    console.error('Quiz submission error:', error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid session - Please login again' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}