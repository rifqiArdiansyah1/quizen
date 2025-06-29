'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react'

type Choice = {
    id?: number
    text: string
    isCorrect: boolean
}

type Question = {
    id?: number
    text: string
    choices: Choice[]
}

type QuizData = {
    id: number
    title: string
    description: string
    questions: Question[]
}

export default function EditQuizPage() {
    const { quizId } = useParams()
    const router = useRouter()
    const [quiz, setQuiz] = useState<QuizData | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Fetch quiz data
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await fetch(`/api/quizess/${quizId}`)
                if (!response.ok) {
                    // Handle 400 and 404 errors specifically
                    if (response.status === 400) {
                        throw new Error('Invalid quiz ID format')
                    } else if (response.status === 404) {
                        throw new Error('Quiz not found')
                    } else {
                        throw new Error('Failed to fetch quiz data')
                    }
                }
                const data = await response.json()
                setQuiz(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load quiz')
            } finally {
                setLoading(false)
            }
        }

        fetchQuiz()
    }, [quizId])

    const addQuestion = () => {
        if (!quiz) return
        setQuiz({
            ...quiz,
            questions: [
                ...quiz.questions,
                {
                    text: '',
                    choices: [
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false }
                    ]
                }
            ]
        })
    }

    const removeQuestion = (index: number) => {
        if (!quiz || quiz.questions.length <= 1) {
            setError('Quiz must have at least one question')
            return
        }
        const newQuestions = [...quiz.questions]
        newQuestions.splice(index, 1)
        setQuiz({ ...quiz, questions: newQuestions })
    }

    const addChoice = (questionIndex: number) => {
        if (!quiz) return
        const newQuestions = [...quiz.questions]
        newQuestions[questionIndex].choices.push({
            text: '',
            isCorrect: false
        })
        setQuiz({ ...quiz, questions: newQuestions })
    }

    const removeChoice = (questionIndex: number, choiceIndex: number) => {
        if (!quiz || quiz.questions[questionIndex].choices.length <= 2) {
            setError('Each question must have at least two choices')
            return
        }
        const newQuestions = [...quiz.questions]
        newQuestions[questionIndex].choices.splice(choiceIndex, 1)
        setQuiz({ ...quiz, questions: newQuestions })
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!quiz) return
        const { name, value } = e.target
        setQuiz({
            ...quiz,
            [name]: value
        })
    }

    const handleQuestionChange = (index: number, text: string) => {
        if (!quiz) return
        const newQuestions = [...quiz.questions]
        newQuestions[index].text = text
        setQuiz({ ...quiz, questions: newQuestions })
    }

    const handleChoiceChange = (questionIndex: number, choiceIndex: number, text: string) => {
        if (!quiz) return
        const newQuestions = [...quiz.questions]
        newQuestions[questionIndex].choices[choiceIndex].text = text
        setQuiz({ ...quiz, questions: newQuestions })
    }

    const handleCorrectAnswerChange = (questionIndex: number, choiceIndex: number) => {
        if (!quiz) return
        const newQuestions = [...quiz.questions]
        // Reset all choices to false
        newQuestions[questionIndex].choices.forEach(choice => {
            choice.isCorrect = false
        })
        // Set selected choice to true
        newQuestions[questionIndex].choices[choiceIndex].isCorrect = true
        setQuiz({ ...quiz, questions: newQuestions })
    }

    const validateForm = () => {
        if (!quiz) {
            setError('Quiz data not loaded')
            return false
        }

        if (!quiz.title.trim()) {
            setError('Quiz title is required')
            return false
        }

        for (let i = 0; i < quiz.questions.length; i++) {
            if (!quiz.questions[i].text.trim()) {
                setError(`Question #${i + 1} cannot be empty`)
                return false
            }

            let hasCorrectAnswer = false
            for (let j = 0; j < quiz.questions[i].choices.length; j++) {
                if (!quiz.questions[i].choices[j].text.trim()) {
                    setError(`Choice #${j + 1} in question #${i + 1} cannot be empty`)
                    return false
                }
                if (quiz.questions[i].choices[j].isCorrect) {
                    hasCorrectAnswer = true
                }
            }

            if (!hasCorrectAnswer) {
                setError(`Question #${i + 1} must have a correct answer`)
                return false
            }
        }

        return true
    }

    const validateQuizData = (quiz: QuizData) => {
        if (!quiz.title.trim()) throw new Error('Title is required')

        quiz.questions.forEach((q, i) => {
            if (!q.text.trim()) throw new Error(`Question ${i + 1} text is required`)
            if (q.choices.length < 2) throw new Error(`Question ${i + 1} needs at least 2 choices`)

            const hasCorrect = q.choices.some(c => c.isCorrect)
            if (!hasCorrect) throw new Error(`Question ${i + 1} needs at least one correct answer`)

            q.choices.forEach((c, j) => {
                if (!c.text.trim()) throw new Error(`Choice ${j + 1} in question ${i + 1} is required`)
            })
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            // Validate quiz data before sending request
            if (quiz) {
                validateQuizData(quiz);
            }

            const response = await fetch(`/api/quizess/${quizId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: quiz?.title,
                    description: quiz?.description,
                    questions: quiz?.questions.map(q => ({
                        text: q.text,
                        choices: q.choices.map(c => ({
                            text: c.text,
                            isCorrect: c.isCorrect
                        }))
                    }))
                })
            })
            
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                throw new Error(`Unexpected response: ${text.slice(0, 100)}...`)
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update quiz')
            }

            setSuccess('Quiz updated successfully!')
            router.push(`/quiz/${quizId}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update quiz'
            setError(message)
            console.error('Update error:', err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/quizess/${quizId}`, {
                    method: 'DELETE'
                })

                if (!response.ok) {
                    throw new Error('Failed to delete quiz')
                }

                router.push('/quiz')
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete quiz')
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a120b] flex flex-col items-center justify-center text-[#a99a80] p-6">
                <Loader2 className="animate-spin h-12 w-12 text-amber-400 mb-4" />
                <p className="text-lg text-[#857862]">Loading quiz data...</p>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-[#1a120b] flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#1a120b] border border-[#3d3226] rounded-xl p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[#a99a80] mb-2">Quiz Not Found</h2>
                    <p className="text-[#857862] mb-6">{error || 'The requested quiz could not be loaded.'}</p>
                    <Link
                        href="/quizzes"
                        className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-medium px-6 py-2 rounded-lg transition-colors inline-block"
                    >
                        Back to Quizzes
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#1a120b] text-[#a99a80]">
            {/* Header */}
            <header className="bg-[#1a120b] border-b border-[#3d3226] sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/quiz/${quizId}`}
                            className="flex items-center gap-2 text-[#857862] hover:text-amber-400 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Back to Quiz</span>
                        </Link>
                        <h1 className="text-xl font-bold text-amber-400">Edit Quiz</h1>
                        <div className="w-10"></div> {/* Spacer untuk balance */}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6 text-green-300">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Quiz Info Section */}
                    <div className="bg-[#1a120b] border border-[#3d3226] rounded-xl p-6">
                        <h2 className="text-xl font-bold text-amber-300 mb-6">Quiz Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-[#857862] text-sm font-medium mb-2">
                                    Title*
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={quiz.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#3d3226] border border-[#4f4335] rounded-lg px-4 py-2 text-[#a99a80] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Quiz title"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-[#857862] text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={quiz.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#3d3226] border border-[#4f4335] rounded-lg px-4 py-2 text-[#a99a80] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Quiz description"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-6">
                        {quiz.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="bg-[#1a120b] border border-[#3d3226] rounded-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-amber-200">
                                        Question #{questionIndex + 1}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(questionIndex)}
                                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                        disabled={quiz.questions.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Remove</span>
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor={`question-${questionIndex}`} className="block text-[#857862] text-sm font-medium mb-2">
                                        Question Text*
                                    </label>
                                    <input
                                        id={`question-${questionIndex}`}
                                        type="text"
                                        value={question.text}
                                        onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                                        className="w-full bg-[#3d3226] border border-[#4f4335] rounded-lg px-4 py-2 text-[#a99a80] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Enter question"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[#857862] text-sm font-medium">
                                        Answer Choices* (Select one correct answer)
                                    </h4>

                                    <div className="space-y-3">
                                        {question.choices.map((choice, choiceIndex) => (
                                            <div key={choiceIndex} className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`correct-answer-${questionIndex}`}
                                                    checked={choice.isCorrect}
                                                    onChange={() => handleCorrectAnswerChange(questionIndex, choiceIndex)}
                                                    className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-[#615544]"
                                                />
                                                <input
                                                    type="text"
                                                    value={choice.text}
                                                    onChange={(e) => handleChoiceChange(questionIndex, choiceIndex, e.target.value)}
                                                    className="flex-1 bg-[#3d3226] border border-[#4f4335] rounded-lg px-4 py-2 text-[#a99a80] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                                    placeholder={`Choice ${choiceIndex + 1}`}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeChoice(questionIndex, choiceIndex)}
                                                    className="text-red-400 hover:text-red-300 p-1"
                                                    disabled={question.choices.length <= 2}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => addChoice(questionIndex)}
                                        className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Choice</span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addQuestion}
                            className="w-full bg-[#3d3226] hover:bg-[#4f4335] border border-[#4f4335] rounded-lg p-4 text-amber-400 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Add Question</span>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="sticky bottom-6 bg-[#1a120b] border border-[#3d3226] rounded-xl p-4 shadow-xl">
                        <div className="flex justify-between gap-4">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-900/50 hover:bg-red-900/70 border border-red-700 text-red-300 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="h-5 w-5" />
                                <span>Delete Quiz</span>
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-6 py-3 rounded-lg font-medium transition-colors flex-1 flex items-center justify-center gap-2 ${submitting
                                    ? 'bg-[#3d3226] text-[#736653] cursor-not-allowed'
                                    : 'bg-amber-700 hover:bg-amber-600 text-[#1a120b]'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin h-5 w-5" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}