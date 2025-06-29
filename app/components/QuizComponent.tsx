"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Choice {
    id: number
    text: string
    isCorrect: boolean
}

interface Question {
    id: number
    text: string
    choices: Choice[]
}

interface Quiz {
    id: number
    title: string
    questions: Question[]
}

export default function QuizComponent({ quiz }: { quiz: Quiz }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedChoices, setSelectedChoices] = useState<Record<number, number>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1

    const handleChoiceSelect = (questionId: number, choiceId: number) => {
        setSelectedChoices(prev => ({
            ...prev,
            [questionId]: choiceId
        }))
    }

    const handleNext = () => {
        setCurrentQuestionIndex(prev => prev + 1)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)

        try {
            // Format answers for submission
            const answers = Object.entries(selectedChoices).map(([questionId, choiceId]) => ({
                questionId: parseInt(questionId),
                choiceId
            }))

            // In a real app, you'd get userId from auth/session
            const userId = 1 // Temporary - replace with actual user ID

            const response = await fetch('/api/quizess/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    quizId: quiz.id,
                    answers
                })
            })

            if (!response.ok) throw new Error('Submission failed')

            const result = await response.json()
            router.push(`/quiz/results?score=${result.score}&total=${result.totalQuestions}&attemptId=${result.attemptId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submission failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-[#2b2116] border border-[#413222] rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-[#16110b]">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    <span className="text-sm font-medium text-[#a78bfa]">
                        {quiz.title}
                    </span>
                </div>

                <h3 className="text-xl font-medium text-[#e2d9d1] mb-6">
                    {currentQuestion.text}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.choices.map((choice) => (
                        <div
                            key={choice.id}
                            className={`p-4 rounded-lg cursor-pointer transition-colors border ${selectedChoices[currentQuestion.id] === choice.id
                                ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-[#e2d9d1]'
                                : 'bg-[#413222] border-[#57432e] hover:bg-[#57432e]'
                                }`}
                            onClick={() => handleChoiceSelect(currentQuestion.id, choice.id)}
                        >
                            {choice.text}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between">
                {currentQuestionIndex > 0 && (
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="bg-[#413222] hover:bg-[#57432e] text-[#e2d9d1] py-2 px-6 rounded transition-colors"
                    >
                        Previous
                    </button>
                )}

                <div className="flex-grow"></div>

                {!isLastQuestion ? (
                    <button
                        onClick={handleNext}
                        disabled={!selectedChoices[currentQuestion.id]}
                        className={`py-2 px-6 rounded transition-colors ${selectedChoices[currentQuestion.id]
                            ? 'bg-[#7c3aed] hover:bg-[#a78bfa] text-[#16110b]'
                            : 'bg-[#413222] text-[#16110b] cursor-not-allowed'
                            }`}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || Object.keys(selectedChoices).length < quiz.questions.length}
                        className={`py-2 px-6 rounded transition-colors ${isSubmitting || Object.keys(selectedChoices).length < quiz.questions.length
                            ? 'bg-[#413222] text-[#16110b] cursor-not-allowed'
                            : 'bg-[#7c3aed] hover:bg-[#a78bfa] text-[#16110b]'
                            }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300">
                    {error}
                </div>
            )}
        </div>
    )
}