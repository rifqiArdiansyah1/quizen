import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUserData(userId: number) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                quizAttempts: {
                    include: {
                        quiz: {
                            include: {
                                questions: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!user) return null

        // Jangan kembalikan password
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
    } catch (error) {
        console.error('Error fetching user data:', error)
        return null
    } finally {
        await prisma.$disconnect()
    }
}

export default async function UserProfilePage({
    params
}: {
    params: { id: string }
}) {
    // Validasi parameter ID
    const userId = Number(params.id)
    if (isNaN(userId)) return notFound()

    const userData = await getUserData(userId)
    if (!userData) return notFound()

    // Hitung statistik
    const totalAttempts = userData.quizAttempts.length
    const quizzesTaken = new Set(userData.quizAttempts.map((a) => a.quizId)).size
    const averageScore = totalAttempts > 0
        ? Math.round(
            userData.quizAttempts.reduce((acc, attempt) =>
                acc + (attempt.score / attempt.quiz.questions.length), 0
            ) / totalAttempts * 100
        )
        : 0

    return (
        <div className="min-h-screen bg-[#16110b] text-[#e2d9d1] p-6">
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumb Navigation */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm text-[#8a7560]">
                        <li>
                            <Link href="/" className="hover:text-[#a78bfa] transition-colors">
                                Home
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link href="/users" className="hover:text-[#a78bfa] transition-colors">
                                Users
                            </Link>
                        </li>
                        <li>/</li>
                        <li className="text-[#c4b8ab]">{userData.name || 'Profile'}</li>
                    </ol>
                </nav>

                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Profile Section */}
                    <div className="bg-[#2b2116] border border-[#413222] rounded-lg p-6 md:w-1/3">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-[#413222] border-2 border-[#7c3aed] flex items-center justify-center mb-4">
                                <span className="text-3xl text-[#a78bfa]">
                                    {userData.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#a78bfa] mb-1">
                                {userData.name || 'Anonymous'}
                            </h2>
                            <p className="text-[#a79685] mb-4">{userData.email}</p>

                            <div className="w-full mt-4 space-y-2">
                                <Link
                                    href="/quiz"
                                    className="block w-full text-center bg-[#7c3aed] hover:bg-[#a78bfa] text-[#16110b] py-2 px-4 rounded transition-colors"
                                >
                                    Take a Quiz
                                </Link>
                                {/* <Link
                                    href={`/users/${userId}/edit`}
                                    className="block w-full text-center border border-[#57432e] hover:border-[#7c3aed] text-[#e2d9d1] py-2 px-4 rounded transition-colors"
                                >
                                    Edit Profile
                                </Link> */}
                            </div>

                            <p className="text-sm text-[#8a7560] mt-4">
                                Member since {new Date(userData.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Quiz History Section */}
                    <div className="bg-[#2b2116] border border-[#413222] rounded-lg p-6 md:w-2/3">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-[#a78bfa]">Quiz History</h3>
                            {userData.quizAttempts.length > 0 && (
                                <span className="text-sm text-[#a79685]">
                                    {totalAttempts} attempts
                                </span>
                            )}
                        </div>

                        {userData.quizAttempts.length === 0 ? (
                            <div className="text-center py-8 text-[#8a7560]">
                                <p>No quiz attempts yet</p>
                                <Link
                                    href="/quiz"
                                    className="text-[#a78bfa] hover:underline mt-2 inline-block"
                                >
                                    Take a quiz now
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userData.quizAttempts.map((attempt) => {
                                    const percentage = Math.round(
                                        (attempt.score / attempt.quiz.questions.length) * 100
                                    )

                                    return (
                                        <Link
                                            key={attempt.id}
                                            href={`/attempts/${attempt.id}`}
                                            className="block hover:opacity-90 transition-opacity"
                                        >
                                            <div className="bg-[#413222] border border-[#57432e] rounded-lg p-4 hover:border-[#7c3aed] transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium text-[#e2d9d1]">
                                                            {attempt.quiz.title}
                                                        </h4>
                                                        <p className="text-sm text-[#8a7560]">
                                                            {new Date(attempt.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${percentage >= 70
                                                                ? 'bg-green-900/30 text-green-300'
                                                                : percentage >= 50
                                                                    ? 'bg-yellow-900/30 text-yellow-300'
                                                                    : 'bg-red-900/30 text-red-300'
                                                            }`}>
                                                            {attempt.score}/{attempt.quiz.questions.length} ({percentage}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Section */}
                <div className="bg-[#2b2116] border border-[#413222] rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#a78bfa] mb-4">Statistics</h3>
                    {userData.quizAttempts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#413222] p-4 rounded-lg">
                                <p className="text-[#8a7560] text-sm">Total Attempts</p>
                                <p className="text-2xl font-bold text-[#a78bfa]">
                                    {totalAttempts}
                                </p>
                            </div>
                            <div className="bg-[#413222] p-4 rounded-lg">
                                <p className="text-[#8a7560] text-sm">Average Score</p>
                                <p className="text-2xl font-bold text-[#a78bfa]">
                                    {averageScore}%
                                </p>
                            </div>
                            <div className="bg-[#413222] p-4 rounded-lg">
                                <p className="text-[#8a7560] text-sm">Quizzes Taken</p>
                                <p className="text-2xl font-bold text-[#a78bfa]">
                                    {quizzesTaken}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[#8a7560]">Complete a quiz to see statistics</p>
                    )}
                </div>
            </div>
        </div>
    )
}