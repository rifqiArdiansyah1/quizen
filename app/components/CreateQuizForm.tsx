// components/CreateQuizForm.tsx
"use client";

import { useState } from 'react';

export default function CreateQuizForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([
        {
            text: '',
            choices: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ],
        },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: '',
                choices: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                ],
            },
        ]);
    };

    const handleAddChoice = (questionIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].choices.push({
            text: '',
            isCorrect: false,
        });
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/quizess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    questions,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create quiz');
            }

            setSuccess(true);
            // Reset form
            setTitle('');
            setDescription('');
            setQuestions([
                {
                    text: '',
                    choices: [
                        { text: '', isCorrect: false },
                        { text: '', isCorrect: false },
                    ],
                },
            ]);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            {questions.map((question, qIndex) => (
                <div key={qIndex} className="border p-4 rounded-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Question {qIndex + 1}
                        </label>
                        <input
                            type="text"
                            value={question.text}
                            onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[qIndex].text = e.target.value;
                                setQuestions(newQuestions);
                            }}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Choices</label>
                        {question.choices.map((choice, cIndex) => (
                            <div key={cIndex} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={choice.text}
                                    onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIndex].choices[cIndex].text = e.target.value;
                                        setQuestions(newQuestions);
                                    }}
                                    required
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <input
                                    type="checkbox"
                                    checked={choice.isCorrect}
                                    onChange={(e) => {
                                        const newQuestions = [...questions];
                                        newQuestions[qIndex].choices[cIndex].isCorrect = e.target.checked;
                                        setQuestions(newQuestions);
                                    }}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-500">Correct?</span>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => handleAddChoice(qIndex)}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Add Choice
                        </button>
                    </div>
                </div>
            ))}

            <div className="flex space-x-4">
                <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Add Question
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {isSubmitting ? 'Creating...' : 'Create Quiz'}
                </button>
            </div>

            {success && (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                    Quiz created successfully!
                </div>
            )}
        </form>
    );
}