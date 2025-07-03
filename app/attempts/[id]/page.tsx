import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getAttemptDetails(attemptId: number) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attempts/${attemptId}`)
    if (!res.ok) return undefined
    return res.json()
}

export default async function AttemptDetailPage({ params }: { params: { id: string } }) {
    const attemptId = Number(params.id)
    const attempt = await getAttemptDetails(attemptId)

    if (!attempt) return notFound()

    const percentage = Math.round((attempt.score / attempt.quiz.questions.length) * 100)

    return (
        <div className="min-h-screen bg-darkwood-900 text-darkwood-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-accent-light mb-1">
                            {attempt.quiz.title}
                        </h1>
                        <p className="text-darkwood-400">
                            Attempted on {new Date(attempt.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg text-lg font-bold ${percentage >= 80
                            ? 'bg-green-900/30 text-green-300'
                            : percentage >= 60
                                ? 'bg-yellow-900/30 text-yellow-300'
                                : 'bg-red-900/30 text-red-300'
                        }`}>
                        Score: {attempt.score}/{attempt.quiz.questions.length} ({percentage}%)
                    </div>
                </div>

                <div className="bg-darkwood-800 border border-darkwood-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-accent-light mb-4">Question Review</h2>

                    <div className="space-y-6">
                        {attempt.quiz.questions.map((question: any) => {
                            const userAnswer = attempt.answers.find((a: any) => a.questionId === question.id)
                            const correctChoice = question.choices.find((c: any) => c.isCorrect)

                            return (
                                <div
                                    key={question.id}
                                    className={`p-4 rounded-lg border ${userAnswer?.choiceId === correctChoice?.id
                                            ? 'border-green-600 bg-green-900/10'
                                            : 'border-red-600 bg-red-900/10'
                                        }`}
                                >
                                    <h3 className="font-medium text-darkwood-100 mb-3">
                                        {question.text}
                                    </h3>

                                    <div className="space-y-2">
                                        {question.choices.map((choice: any) => (
                                            <div
                                                key={choice.id}
                                                className={`p-3 rounded border ${choice.isCorrect
                                                        ? 'border-green-600 bg-green-900/20'
                                                        : userAnswer?.choiceId === choice.id
                                                            ? 'border-red-600 bg-red-900/20'
                                                            : 'border-darkwood-600'
                                                    }`}
                                            >
                                                {choice.text}
                                                {choice.isCorrect && (
                                                    <span className="ml-2 text-xs text-green-300">(Correct answer)</span>
                                                )}
                                                {userAnswer?.choiceId === choice.id && !choice.isCorrect && (
                                                    <span className="ml-2 text-xs text-red-300">(Your answer)</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {userAnswer?.choiceId !== correctChoice?.id && (
                                        <p className="mt-3 text-sm text-darkwood-300">
                                            <span className="text-red-300">Incorrect.</span> The correct answer is "{correctChoice?.text}".
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Link
                            href={`/quiz/${attempt.quizId}`}
                            className="bg-accent-dark hover:bg-accent-light text-darkwood-900 py-2 px-6 rounded transition-colors"
                        >
                            Retake Quiz
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}