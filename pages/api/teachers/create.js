import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

export default function CreateTeacher() {
    // 1. Get the session to check user role
    const { data: session, status } = useSession()
    const router = useRouter()

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    // 2. Handle loading and unauthorized states
    if (status === 'loading') {
        return <p className="text-center py-10">กำลังโหลด...</p>
    }
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        return <p className="text-center py-10 text-red-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        // Clear error message on input change
        if (error) setError('')
        if (success) setSuccess('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // 3. Client-side input validation
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน')
            return
        }

        if (form.password.length < 6) {
            setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await res.json()

            if (!res.ok) {
                // 4. Handle API errors based on status code
                // The API now returns structured errors like { error: '...', message: '...' }
                setError(data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
            } else {
                setSuccess('สร้างบัญชีครูสำเร็จแล้ว!')
                // Clear the form after successful creation
                setForm({ name: '', email: '', password: '' })
                // Optional: Redirect after a short delay to show the success message
                setTimeout(() => {
                    router.push('/admin/teachers')
                }, 1500)
            }
        } catch (err) {
            console.error('Failed to create teacher:', err)
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto px-6 py-10">
            <Head>
                <title>เพิ่มครู - Admin Dashboard</title>
            </Head>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">➕ เพิ่มครู</h1>
                <Link href="/admin/teachers" legacyBehavior>
                    <a className="text-blue-600 hover:underline">
                        &larr; ย้อนกลับ
                    </a>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                {/* 5. Display error and success messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อครู</label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อีเมล</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">รหัสผ่าน</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        }`}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            กำลังบันทึก...
                        </>
                    ) : (
                        'บันทึก'
                    )}
                </button>
            </form>
        </div>
    )
}