'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Edit } from 'lucide-react';

type Quiz = {
    id: number;
    title: string;
    description: string;
    questions: {
        id: number;
        text: string;
    }[];
};

export default function QuizPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/quizess');

            if (!res.ok) {
                throw new Error('Failed to load quizzes');
            }

            const data = await res.json();
            setQuizzes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleDelete = async (quizId: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus quiz ini?')) return;

        try {
            const res = await fetch(`/api/quizess/${quizId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete quiz');
            }

            // Refresh list setelah delete
            fetchQuizzes();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (quizId: number) => {
        router.push(`/quiz/${quizId}/edit`);
    };

    return (
        <main className="min-h-screen bg-[#1e1b17] text-white px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-amber-100">
                        Daftar Kuis
                    </h1>
                    <Link
                        href="/quiz/new"
                        className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-md transition"
                    >
                        Buat Kuis Baru
                    </Link>
                </div>

                {loading && (
                    <p className="text-center text-amber-300">Memuat kuis...</p>
                )}

                {error && (
                    <p className="text-center text-red-400">Error: {error}</p>
                )}

                {!loading && !error && quizzes.length === 0 && (
                    <p className="text-center text-amber-200">Belum ada kuis tersedia.</p>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-[#2a2521] rounded-xl shadow-lg p-6 border border-amber-900 hover:shadow-amber-400/20 transition-shadow relative"
                        >
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleEdit(quiz.id)}
                                    className="text-amber-400 hover:text-amber-300 transition-colors"
                                    aria-label="Edit quiz"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(quiz.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    aria-label="Delete quiz"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <h2 className="text-2xl font-semibold text-amber-100 mb-2 pr-8">
                                {quiz.title}
                            </h2>
                            <p className="text-amber-300 text-sm mb-4">
                                {quiz.description || 'Tidak ada deskripsi.'}
                            </p>
                            <p className="text-amber-400 text-sm mb-4">
                                {quiz.questions.length} pertanyaan
                            </p>
                            <div className="flex justify-between items-center">
                                <Link
                                    href={`/quiz/${quiz.id}`}
                                    className="inline-block bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-md transition"
                                >
                                    Mulai
                                </Link>
                                {/* <Link
                                    href={`/quiz/${quiz.id}/results`}
                                    className="text-amber-400 hover:text-amber-300 text-sm"
                                >
                                    Lihat Hasil
                                </Link> */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}