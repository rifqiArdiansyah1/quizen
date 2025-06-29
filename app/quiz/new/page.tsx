'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react'

type Choice = {
    text: string
    isCorrect: boolean
}

type Question = {
    text: string
    choices: Choice[]
}

export default function CreateQuizPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    })
    const [questions, setQuestions] = useState<Question[]>([
        {
            text: '',
            choices: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ]
        }
    ])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: '',
                choices: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ]
            }
        ])
    }

    const removeQuestion = (index: number) => {
        if (questions.length <= 1) {
            setError('Quiz harus memiliki minimal 1 pertanyaan')
            return
        }
        const newQuestions = [...questions]
        newQuestions.splice(index, 1)
        setQuestions(newQuestions)
    }

    const addChoice = (questionIndex: number) => {
        const newQuestions = [...questions]
        newQuestions[questionIndex].choices.push({
            text: '',
            isCorrect: false
        })
        setQuestions(newQuestions)
    }

    const removeChoice = (questionIndex: number, choiceIndex: number) => {
        const newQuestions = [...questions]
        if (newQuestions[questionIndex].choices.length <= 2) {
            setError('Setiap pertanyaan harus memiliki minimal 2 pilihan jawaban')
            return
        }
        newQuestions[questionIndex].choices.splice(choiceIndex, 1)
        setQuestions(newQuestions)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleQuestionChange = (index: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[index].text = text
        setQuestions(newQuestions)
    }

    const handleChoiceChange = (questionIndex: number, choiceIndex: number, text: string) => {
        const newQuestions = [...questions]
        newQuestions[questionIndex].choices[choiceIndex].text = text
        setQuestions(newQuestions)
    }

    const handleCorrectAnswerChange = (questionIndex: number, choiceIndex: number) => {
        const newQuestions = [...questions]
        // Reset semua pilihan ke false
        newQuestions[questionIndex].choices.forEach(choice => {
            choice.isCorrect = false
        })
        // Set pilihan yang dipilih ke true
        newQuestions[questionIndex].choices[choiceIndex].isCorrect = true
        setQuestions(newQuestions)
    }

    const validateForm = () => {
        setError('') // Reset error message

        if (!formData.title.trim()) {
            setError('Judul quiz harus diisi')
            return false
        }

        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].text.trim()) {
                setError(`Pertanyaan #${i + 1} harus diisi`)
                return false
            }

            let hasCorrectAnswer = false
            for (let j = 0; j < questions[i].choices.length; j++) {
                if (!questions[i].choices[j].text.trim()) {
                    setError(`Pilihan jawaban #${j + 1} pada pertanyaan #${i + 1} harus diisi`)
                    return false
                }
                if (questions[i].choices[j].isCorrect) {
                    hasCorrectAnswer = true
                }
            }

            if (!hasCorrectAnswer) {
                setError(`Pertanyaan #${i + 1} harus memiliki jawaban yang benar`)
                return false
            }
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/quizess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    questions
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Gagal membuat quiz')
            }

            const data = await response.json()
            router.push(`/quiz/${data.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat quiz')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#1a120b] text-[#a99a80]">
            {/* Header */}
            <header className="bg-[#1a120b] border-b border-[#3d3226] sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/quiz"
                            className="flex items-center gap-2 text-[#857862] hover:text-amber-400 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Kembali</span>
                        </Link>
                        <h1 className="text-xl font-bold text-amber-400">Buat Quiz Baru</h1>
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

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Quiz Info Section */}
                    <div className="bg-[#1a120b] border border-[#3d3226] rounded-xl p-6">
                        <h2 className="text-xl font-bold text-amber-300 mb-6">Informasi Quiz</h2>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-[#857862] text-sm font-medium mb-2">
                                    Judul Quiz*
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#3d3226] border border-[#4f4335] rounded-lg px-4 py-2 text-[#a99a80] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Contoh: Quiz Matematika Dasar"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-[#857862] text-sm font-medium mb-2">
                                    Deskripsi
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#3d3226] border border-[#4f4335] rounded-lg px-4 py-2 text-[#a99a80] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    placeholder="Deskripsi singkat tentang quiz ini"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-6">
                        {questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="bg-[#1a120b] border border-[#3d3226] rounded-xl p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-amber-200">
                                        Pertanyaan #{questionIndex + 1}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(questionIndex)}
                                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                                        disabled={questions.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Hapus</span>
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <label htmlFor={`question-${questionIndex}`} className="block text-[#857862] text-sm font-medium mb-2">
                                        Pertanyaan*
                                    </label>
                                    <input
                                        id={`question-${questionIndex}`}
                                        type="text"
                                        value={question.text}
                                        onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                                        className="w-full bg-[#3d3226] border border-[#4f4335] rounded-lg px-4 py-2 text-[#a99a80] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        placeholder="Masukkan pertanyaan"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[#857862] text-sm font-medium">
                                        Pilihan Jawaban* (Pilih satu jawaban benar)
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
                                                    placeholder={`Pilihan jawaban ${choiceIndex + 1}`}
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
                                        <span>Tambah Pilihan Jawaban</span>
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
                            <span>Tambah Pertanyaan</span>
                        </button>
                    </div>

                    {/* Submit Section */}
                    <div className="sticky bottom-6 bg-[#1a120b] border border-[#3d3226] rounded-xl p-4 shadow-xl">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${loading
                                    ? 'bg-[#3d3226] text-[#736653] cursor-not-allowed'
                                    : 'bg-amber-700 hover:bg-amber-600 text-[#1a120b]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                    <span>Menyimpan Quiz...</span>
                                </>
                            ) : (
                                <span>Simpan Quiz</span>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}