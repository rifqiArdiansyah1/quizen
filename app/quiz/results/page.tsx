"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function QuizResults() {
    const searchParams = useSearchParams()
    const score = searchParams.get('score')
    const total = searchParams.get('total')
    const attemptId = searchParams.get('attemptId')

    if (!score || !total) return (
        <div className="min-h-screen bg-darkwood-900 text-darkwood-100 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-accent-light mb-6">Results Not Found</h1>
                <Link
                    href="/"
                    className="text-accent-light hover:underline"
                >
                    Return to home
                </Link>
            </div>
        </div>
    )

    const percentage = Math.round((Number(score) / Number(total)) * 100)
    let resultColor = 'text-red-400'
    let resultMessage = 'Keep practicing!'

    if (percentage >= 80) {
        resultColor = 'text-green-400'
        resultMessage = 'Excellent work!'
    } else if (percentage >= 60) {
        resultColor = 'text-yellow-400'
        resultMessage = 'Good job!'
    }

    return (
        <div className="min-h-screen bg-darkwood-900 text-darkwood-100 p-6">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-accent-light mb-6">Quiz Completed</h1>

                <div className="bg-darkwood-800 border border-darkwood-700 rounded-lg p-8 mb-8">
                    <div className={`text-6xl font-bold mb-4 ${resultColor}`}>
                        {percentage}%
                    </div>
                    <div className="text-xl font-medium text-darkwood-200 mb-2">
                        {resultMessage}
                    </div>
                    <div className="text-darkwood-300">
                        You scored {score} out of {total} questions correctly.
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <Link
                        href="/"
                        className="bg-darkwood-700 hover:bg-darkwood-600 text-darkwood-100 py-2 px-6 rounded transition-colors"
                    >
                        Back to Home
                    </Link>
                    <Link
                        href={`/attempts/${attemptId}`}
                        className="bg-[#7c3aed] hover:bg-accent-light text-darkwood-900 py-2 px-6 rounded transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    )
}