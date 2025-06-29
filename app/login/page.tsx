"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

// Schema validasi dengan Zod
const loginSchema = z.object({
    email: z.string().email('Email tidak valid').min(1, 'Email diperlukan'),
    password: z.string().min(6, 'Password minimal 6 karakter')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        try {
            setError('')

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include' // Untuk mengirim cookie
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Login gagal')
            }

            // Redirect ke halaman setelah login berhasil
            router.push('/quiz')
            router.refresh() // Memastikan data terupdate
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat login')
        }
    }

    return (
        <div className="min-h-screen bg-[#16110b] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#2b2116] rounded-lg shadow-lg border border-[#413222] p-8">
                <h1 className="text-3xl font-bold text-[#a78bfa] mb-2 text-center">Welcome Back</h1>
                <p className="text-[#a79685] mb-8 text-center">Sign in to your account</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#c4b8ab] mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={`w-full bg-[#413222] border ${errors.email ? 'border-red-500' : 'border-[#57432e]'} rounded-lg px-4 py-2 text-[#e2d9d1] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#c4b8ab] mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            {...register('password')}
                            className={`w-full bg-[#413222] border ${errors.password ? 'border-red-500' : 'border-[#57432e]'} rounded-lg px-4 py-2 text-[#e2d9d1] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent`}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[#7c3aed] focus:ring-[#7c3aed] border-[#57432e] rounded bg-[#413222]"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-[#a79685]">
                                Remember me
                            </label>
                        </div>

                        <Link href="/forgot-password" className="text-sm text-[#a78bfa] hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isSubmitting
                                ? 'bg-[#57432e] text-[#8a7560] cursor-not-allowed'
                                : 'bg-[#7c3aed] hover:bg-[#a78bfa] text-[#16110b]'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5" />
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-[#a79685]">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-[#a78bfa] hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}