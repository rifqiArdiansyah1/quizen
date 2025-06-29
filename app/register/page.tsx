"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validasi client-side
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            // Redirect ke halaman login setelah registrasi berhasil
            router.push('/login?registered=true')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#16110b] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#2b2116] rounded-lg shadow-lg border border-[#413222] p-8">
                <h1 className="text-3xl font-bold text-[#a78bfa] mb-2 text-center">Create Account</h1>
                <p className="text-[#a79685] mb-8 text-center">Join us today</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#c4b8ab] mb-1">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#413222] border border-[#57432e] rounded-lg px-4 py-2 text-darkwood-100 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#c4b8ab] mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#413222] border border-[#57432e] rounded-lg px-4 py-2 text-darkwood-100 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#c4b8ab] mb-1">
                            Password (min 6 characters)
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#413222] border border-[#57432e] rounded-lg px-4 py-2 text-darkwood-100 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#c4b8ab] mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#413222] border border-[#57432e] rounded-lg px-4 py-2 text-darkwood-100 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isLoading
                                ? 'bg-[#57432e] text-[#8a7560] cursor-not-allowed'
                                : 'bg-[#7c3aed] hover:bg-[#a78bfa] text-[#16110b]'
                            }`}
                    >
                        {isLoading ? 'Creating account...' : 'Sign up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[#a79685]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#a78bfa] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}