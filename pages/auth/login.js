// pages/auth/login.js
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        const result = await signIn('credentials', {
            redirect: false, // Do not redirect automatically
            email,
            password,
        });

        if (result.error) {
            setError(result.error);
            console.error('Login error:', result.error); // Log error to console for debugging
        } else {
            // Check if login was successful and then redirect based on role
            // This assumes your NextAuth.js callback returns a user object with a role
            const session = await fetch('/api/auth/session').then(res => res.json());
            if (session && session.user) {
                if (session.user.role === 'teacher') {
                    router.push('/dashboard/teacher');
                } else if (session.user.role === 'student') {
                    router.push('/dashboard/student'); // Assuming you have a student dashboard
                } else {
                    router.push('/'); // Default redirect for other roles or general successful login
                }
            } else {
                // Fallback if session is not immediately available after signIn
                router.push('/');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <Head>
                <title>เข้าสู่ระบบ</title>
            </Head>
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
                <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">เข้าสู่ระบบ</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            อีเมล
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                            placeholder="your.email@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        ยังไม่มีบัญชี?{' '}
                        <button
                            onClick={() => router.push('/auth/register')}
                            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                        >
                            ลงทะเบียนที่นี่
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
