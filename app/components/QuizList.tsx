"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Quiz {
    id: number
    title: string
    description: string
    questions: {
        id: number
        text: string
    }[]
}

export default function QuizList() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await fetch('/api/quizess')
                if (!response.ok) throw new Error('Failed to fetch quizzes')
                const data = await response.json()
                setQuizzes(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchQuizzes()
    }, [])

    if (loading) return <div className="text-accent-light animate-pulse">Loading quizzes...</div>
    if (error) return <div className="text-red-400">Error: {error}</div>

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-accent-light mb-6">Available Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.id}
                        className="bg-darkwood-800 border border-darkwood-700 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-accent-dark"
                    >
                        <h3 className="text-xl font-semibold text-accent-light mb-2">{quiz.title}</h3>
                        <p className="text-darkwood-200 mb-4">{quiz.description || 'No description'}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-darkwood-300">
                                {quiz.questions.length} questions
                            </span>
                            <Link
                                href={`/quiz/${quiz.id}`}
                                className="bg-accent-dark hover:bg-accent-light text-darkwood-900 font-medium py-2 px-4 rounded transition-colors"
                            >
                                Start Quiz
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}