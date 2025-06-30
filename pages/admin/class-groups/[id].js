import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
import Alert from '../../../components/Alert' // Import the improved Alert component

// ---
// 1. Loading and Unauthorized States
// ---

export default function EditClassGroup() {
    const { data: session, status } = useSession() // Get loading status from useSession
    const router = useRouter()
    const { id } = router.query

    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true) // Initial loading state for data fetch
    const [formSubmitting, setFormSubmitting] = useState(false) // Separate state for form submission
    const [error, setError] = useState('')
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('info')

    // ---
    // 2. Data Fetching
    // ---

    useEffect(() => {
        if (!id || status === 'loading') return

        const fetchClassGroup = async () => {
            try {
                const res = await fetch(`/api/admin/class-groups/${id}`)
                if (!res.ok) {
                    throw new Error('Failed to fetch class group data.')
                }
                const data = await res.json()
                setName(data.name || '')
                setLoading(false)
            } catch (err) {
                setError('ไม่พบข้อมูลกลุ่มเรียนนี้ หรือเกิดข้อผิดพลาดในการโหลด')
                setLoading(false)
            }
        }

        fetchClassGroup()
    }, [id, status])

    // ---
    // 3. Form Submission Handler
    // ---

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormSubmitting(true)
        setError('') // Clear previous errors
        setAlertMessage('')

        try {
            const res = await fetch(`/api/admin/class-groups/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
            }

            // Show success alert and redirect
            setAlertType('success')
            setAlertMessage('✅ บันทึกข้อมูลเรียบร้อยแล้ว! กำลังนำทางกลับ...')
            setTimeout(() => {
                router.push('/admin/class-groups')
            }, 1500)
        } catch (err) {
            setError(err.message)
            setAlertType('error')
            setAlertMessage(err.message)
        } finally {
            setFormSubmitting(false)
        }
    }

    // ---
    // 4. Render UI based on state
    // ---

    // Show a loading state while fetching user session
    if (status === 'loading' || loading) {
        return (
            <Layout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6 h-16 w-16 animate-spin rounded-full border-4 border-solid border-emerald-500 border-t-transparent"></div>
                        <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
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
                    <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                        ✏️ แก้ไขกลุ่มเรียน
                    </span>
                </h1>
                <div className="mx-auto max-w-2xl">
                    {alertMessage && (
                        <div className="mb-6">
                            <Alert type={alertType} message={alertMessage} dismissible />
                        </div>
                    )}

                    {error && (
                        <div className="mb-6">
                            <Alert type="error" message={error} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-box animate-fade-in-up">
                        <div className="form-group mb-6">
                            <label htmlFor="name" className="form-label">
                                ชื่อกลุ่มเรียน
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-input"
                                placeholder="เช่น ม.4/1, ห้องเรียนพิเศษ"
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
                                    <span>บันทึกการเปลี่ยนแปลง</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    )
}