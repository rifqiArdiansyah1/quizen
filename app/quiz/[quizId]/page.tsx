// app/quiz/[quizId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State baru untuk menyimpan jawaban yang dipilih pengguna
  // Format: { questionId: choiceId, ... }
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    const fetchQuestions = async () => {
      // ... (Kode fetchQuestions sama seperti contoh sebelumnya, kita singkat di sini)
      try {
        setLoading(true);
        const response = await fetch(`/api/quizzes/${quizId}/questions`);
        if (!response.ok) throw new Error('Gagal memuat pertanyaan');
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId]);
  
  // Fungsi untuk menangani saat pengguna memilih jawaban
  const handleAnswerChange = (questionId, choiceId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  // Fungsi untuk menangani saat form disubmit
  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1, // Ganti dengan ID user yang sedang login
          answers: selectedAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim jawaban.');
      }

      const result = await response.json();
      // Arahkan ke halaman hasil dengan skor
      alert(`Kuis Selesai! Skor Anda: ${result.score}`);
      // Di aplikasi nyata, Anda mungkin akan redirect:
      // router.push(`/quiz/result/${result.attemptId}`);

    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 border-b pb-4">Kuis Dimulai!</h1>
        
        <form onSubmit={handleSubmitQuiz}>
          <div className="space-y-10">
            {questions.map((question, index) => (
              <div key={question.id} className="p-6 bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg">
                <p className="text-xl font-semibold mb-4 text-gray-700">
                  <span className="text-blue-600 mr-2">{index + 1}.</span>{question.text}
                </p>
                
                <div className="space-y-3">
                  {question.choices.map((choice) => (
                    <label key={choice.id} className="flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer has-[:checked]:bg-blue-100 has-[:checked]:border-blue-400">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice.id}
                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        onChange={() => handleAnswerChange(question.id, choice.id)}
                        required
                      />
                      <span className="text-gray-800">{choice.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mengirim...' : 'Selesai & Kirim Jawaban'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}