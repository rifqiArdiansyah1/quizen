// app/quiz/[quizId]/page.js
'use client'; // Wajib, karena kita menggunakan hooks dan interaksi client

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Hook untuk mendapatkan parameter dari URL

export default function QuizPage() {
  const params = useParams(); // Mendapatkan { quizId: 'nilai-id-nya' }
  const quizId = params.quizId;

  // Tipe data untuk pertanyaan dan pilihan
  type Choice = { id: string; text: string };
  type Question = { id: string; text: string; choices: Choice[] };

  // State untuk menyimpan data, status loading, dan error
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // useEffect akan berjalan saat komponen pertama kali di-render
  useEffect(() => {
    // Pastikan quizId sudah ada sebelum fetch
    if (!quizId) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true); // Mulai loading
        const response = await fetch(`/api/quiz/${quizId}/questions`);

        if (!response.ok) {
          // Jika status response bukan 2xx (cth: 404, 500)
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal memuat data');
        }

        const data = await response.json();
        setQuestions(data); // Simpan data ke state
        setError(null); // Hapus error jika sebelumnya ada
      } catch (err) {
        setError(err.message); // Tangkap dan simpan pesan error
      } finally {
        setLoading(false); // Hentikan loading, baik sukses maupun gagal
      }
    };

    fetchQuestions();
  }, [quizId]); // Dependency array: useEffect akan jalan lagi jika quizId berubah

  // Tampilan kondisional berdasarkan state
  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading pertanyaan...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Kuis Dimulai!</h1>
      <hr />
      
      {questions.map((question, index) => (
        <div key={question.id} style={{ marginBottom: '2rem' }}>
          <h3>Pertanyaan {index + 1}: {question.text}</h3>
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {question.choices.map((choice) => (
              <li key={choice.id} style={{ margin: '0.5rem 0' }}>
                <label>
                  <input type="radio" name={`question-${question.id}`} value={choice.id} />
                  {choice.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <button style={{ padding: '10px 20px', fontSize: '1rem' }}>Selesai & Kirim Jawaban</button>
    </div>
  );
}