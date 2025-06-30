import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../../components/Layout'
import Alert from '../../../components/Alert' // Import the improved Alert component

// ---
// 1. Component Logic and State
// ---

export default function CreateTeacher() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [form, setForm] = useState({ name: '', email: '' })
    const [formSubmitting, setFormSubmitting] = useState(false) // Separate state for form submission
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('info')

    // ---
    // 2. Form Submission Handler
    // ---

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormSubmitting(true)
        setAlertMessage('') // Clear previous alerts

        try {
            const res = await fetch('/api/admin/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการสร้างครู')
            }

            // Show success alert and redirect
            setAlertType('success')
            setAlertMessage('✅ สร้างบัญชีครูใหม่สำเร็จ! กำลังนำทางกลับ...')
            setTimeout(() => {
                router.push('/admin/teachers')
            }, 1500)
        } catch (err) {
            setAlertType('error')
            setAlertMessage(err.message)
        } finally {
            setFormSubmitting(false)
        }
    }

    // ---
    // 3. Render UI based on state
    // ---

    // Show a loading state while fetching user session
    if (status === 'loading') {
        return (
            <Layout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6 h-16 w-16 animate-spin rounded-full border-4 border-solid border-emerald-500 border-t-transparent"></div>
                        <p className="text-gray-600 dark:text-gray-400">กำลังตรวจสอบสิทธิ์...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // Unauthorized access
    if (session?.user?.role !== 'admin') {
        return (
            <Layout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <Alert
                        type="error"
                        message="⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาเข้าสู่ระบบในฐานะผู้ดูแลระบบ"
                    />
                </div>
            </Layout>
        )
    }

    // Main Content
    return (
        <Layout>
            <div className="main-content-container">
                <h1 className="page-title text-center">
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                        ➕ เพิ่มครูใหม่
                    </span>
                </h1>
                <div className="mx-auto max-w-lg">
                    {alertMessage && (
                        <div className="mb-6">
                            <Alert type={alertType} message={alertMessage} dismissible />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-box animate-fade-in-up">
                        <div className="form-group mb-6">
                            <label htmlFor="name" className="form-label">
                                ชื่อครู
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="ชื่อ-นามสกุล"
                                required
                            />
                        </div>

                        <div className="form-group mb-6">
                            <label htmlFor="email" className="form-label">
                                อีเมล
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="example@email.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={formSubmitting}
                        >
                            {formSubmitting ? (
                                <>
                                    <svg
                                        className="h-5 w-5 animate-spin"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    <span>กำลังบันทึก...</span>
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <span>สร้างบัญชีครู</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    )
}