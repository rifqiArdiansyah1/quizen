'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Trophy, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'

type Choice = {
  id: number
  text: string
  isCorrect: boolean
}

type Question = {
  id: number
  text: string
  choices: Choice[]
  quizId: number
}

export default function QuizPage() {
  const { quizId } = useParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<{
    score: number
    totalQuestions: number
    attemptId: number
    quizTitle: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/quizess/${quizId}/questions`)
        if (!res.ok) throw new Error('Failed to fetch questions')
        const data = await res.json()
        setQuestions(data)
      } catch (err) {
        console.error('Failed to fetch questions', err)
        setError('Gagal memuat pertanyaan')
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [quizId])

  const handleSelect = (questionId: number, choiceId: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }))
  }

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      setError('Harap jawab semua pertanyaan sebelum mengirim')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const answers = Object.entries(selectedAnswers).map(([questionId, choiceId]) => ({
        questionId: parseInt(questionId),
        choiceId
      }))

      const res = await fetch('/api/quizess/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          quizId,
          answers
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim jawaban')
      }

      setResult(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim jawaban')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a120b] flex flex-col items-center justify-center text-[#a99a80] p-6">
        <Loader2 className="animate-spin h-12 w-12 text-amber-400 mb-4" />
        <p className="text-lg text-[#857862]">Memuat pertanyaan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a120b] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#2a2118] border border-[#3d3226] rounded-xl p-6 text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#a99a80] mb-2">Terjadi Kesalahan</h2>
          <p className="text-[#857862] mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-medium px-6 py-2 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="border border-[#4f4335] hover:bg-[#3d3226] text-[#a99a80] px-6 py-2 rounded-lg transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a120b] text-[#a99a80]">
      {/* Header */}
      <header className="bg-[#2a2118] border-b border-[#3d3226] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#857862] hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali</span>
          </button>
          <h1 className="text-xl font-bold text-amber-400">QuizCerdas</h1>
          <div className="w-10"></div> {/* Spacer untuk balance */}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {result ? (
          <div className="text-center">
            <div className="bg-[#2a2118] border border-amber-800 rounded-xl p-8 mb-8">
              <div className="inline-flex items-center justify-center bg-amber-900/30 border border-amber-700 rounded-full p-4 mb-6">
                <Trophy className="h-12 w-12 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-amber-300 mb-2">Kuis Selesai!</h2>
              <p className="text-[#857862] mb-8">Anda telah menyelesaikan: <span className="font-medium text-amber-200">{result.quizTitle}</span></p>

              <div className="bg-[#3d3226] rounded-lg p-6 mb-8 border border-[#4f4335]">
                <p className="text-5xl font-bold text-amber-300 mb-2">
                  {result.score}<span className="text-[#736653]">/</span>{result.totalQuestions}
                </p>
                <p className="text-xl text-amber-400">
                  ({Math.round((result.score / result.totalQuestions) * 100)}%)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* <button
                  onClick={() => router.push(`/attempts/${result.attemptId}`)}
                  className="bg-amber-700 hover:bg-amber-600 text-[#1a120b] font-medium px-6 py-3 rounded-lg transition-colors flex-1 max-w-xs mx-auto"
                >
                  Lihat Detail Jawaban
                </button> */}
                <button
                  onClick={() => router.push('/quiz')}
                  className="border border-[#4f4335] hover:bg-[#3d3226] text-[#a99a80] px-6 py-3 rounded-lg transition-colors flex-1 max-w-xs mx-auto"
                >
                  Coba Kuis Lain
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-amber-300 mb-2">Kuis</h2>
              <p className="text-[#736653]">
                Jawab semua pertanyaan dengan benar!
              </p>
            </div>

            <div className="space-y-6 mb-10">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-[#2a2118] rounded-xl p-6 border border-[#3d3226] shadow-lg"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="bg-amber-900/50 text-amber-300 font-medium rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-medium text-[#a99a80]">{q.text}</h3>
                  </div>

                  <div className="space-y-3 pl-11">
                    {q.choices.map((c) => (
                      <label
                        key={c.id}
                        className={`block cursor-pointer rounded-lg p-4 transition-all ${selectedAnswers[q.id] === c.id
                            ? 'bg-amber-800/50 border-amber-600 text-amber-100'
                            : 'bg-[#3d3226] border-[#4f4335] hover:border-amber-500 text-[#978971]'
                          } border`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={c.id}
                          checked={selectedAnswers[q.id] === c.id}
                          onChange={() => handleSelect(q.id, c.id)}
                          className="hidden"
                        />
                        <div className="flex items-center gap-3">
                          <span className={`flex-shrink-0 w-5 h-5 rounded-full border ${selectedAnswers[q.id] === c.id
                              ? 'bg-amber-400 border-amber-400'
                              : 'bg-[#2a2118] border-[#615544]'
                            }`}></span>
                          <span>{c.text}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-6 bg-[#2a2118] border border-[#3d3226] rounded-xl p-4 shadow-xl">
              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4 text-red-300 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-[#736653]">
                  {Object.keys(selectedAnswers).length}/{questions.length} pertanyaan terjawab
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(selectedAnswers).length !== questions.length}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${submitting || Object.keys(selectedAnswers).length !== questions.length
                      ? 'bg-[#3d3226] text-[#736653] cursor-not-allowed'
                      : 'bg-amber-700 hover:bg-amber-600 text-[#1a120b]'
                    }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Mengirim...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Kirim Jawaban
                    </span>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}