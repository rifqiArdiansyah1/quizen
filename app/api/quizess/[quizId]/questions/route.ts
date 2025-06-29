import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  try {
    const quizId = parseInt(params.quizId)
    if (isNaN(quizId)) {
      return NextResponse.json(
        { error: 'Invalid quiz ID' },
        { status: 400 }
      )
    }

    const questions = await prisma.question.findMany({
      where: { quizId },
      include: {
        choices: {
          select: {
            id: true,
            text: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}