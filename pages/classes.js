// pages/classes.js
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ClassesPage({ initialClassGroups }) {
    // 1. Manage UI state more robustly with useSession
    const { data: session, status } = useSession()
    const router = useRouter()

    // 2. Use a single state for managing fetch status and data
    const [classGroups, setClassGroups] = useState(initialClassGroups)
    const [newClassName, setNewClassName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    // 3. Handle data fetching and re-fetching
    const fetchClassGroups = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/classes')
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'ไม่สามารถโหลดข้อมูลชั้นเรียนได้')
            }
            const data = await res.json()
            setClassGroups(data)
        } catch (err) {
            console.error('Failed to fetch class groups:', err)
            setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        } finally {
            setIsLoading(false)
        }
    }

    // 4. Client-side authentication check using useSession status
    if (status === 'loading') {
        return (
            <Layout>
                <div className="text-center py-20 text-gray-500">
                    <p>กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </Layout>
        )
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        // Redirect to a specific access denied page or show a message
        useEffect(() => {
            router.push('/access-denied')
        }, [router])
        return null // Render nothing while redirecting
    }

    // 5. Handlers with improved UX and error handling
    const handleAddClass = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!newClassName.trim()) {
            setError('กรุณากรอกชื่อชั้นเรียน')
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newClassName.trim() }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'ไม่สามารถเพิ่มชั้นเรียนได้')
            }

            setNewClassName('')
            setSuccess('เพิ่มชั้นเรียนสำเร็จ!')
            await fetchClassGroups() // Re-fetch to update the list
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการเพิ่มชั้นเรียน')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteClass = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบชั้นเรียนนี้?')) {
            return
        }
        setIsLoading(true)
        setError(null)
        setSuccess(null)
        try {
            const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'ไม่สามารถลบชั้นเรียนได้')
            }
            setSuccess('ลบชั้นเรียนสำเร็จ!')
            await fetchClassGroups() // Re-fetch to update the list
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการลบข้อมูล')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Layout>
            <Head>
                <title>จัดการชั้นเรียน - Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="page-container max-w-2xl mx-auto py-12 px-6">
                <h1 className="page-title text-4xl font-bold mb-8 text-center">📚 จัดการชั้นเรียน</h1>

                {/* 6. Form to add a new class with loading state */}
                <form onSubmit={handleAddClass} className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="ชื่อชั้นเรียน เช่น ม.2/1"
                        className="flex-1 w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white transition-colors"
                        required
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600"
                        disabled={isLoading}
                    >
                        {isLoading ? 'กำลังเพิ่ม...' : '➕ เพิ่ม'}
                    </button>
                </form>

                {/* 7. Display feedback messages */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}

                {/* 8. Display list of classes with delete button */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    {isLoading && classGroups.length === 0 ? (
                        <p className="text-center text-gray-500">กำลังโหลด...</p>
                    ) : classGroups.length === 0 ? (
                        <p className="text-center text-gray-500">ยังไม่มีชั้นเรียนในระบบ</p>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {classGroups.map(c => (
                                <li key={c.id} className="flex items-center justify-between py-3">
                                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{c.name}</span>
                                    <button
                                        onClick={() => handleDeleteClass(c.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Layout>
    )
}

// 9. Server-side data fetching for initial render
export async function getServerSideProps(context) {
    const session = await getSession(context)

    // Server-side authorization check
    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        }
    }

    // Use absolute URL for server-side fetching
    const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`
    try {
        const res = await fetch(`${baseUrl}/api/classes`)
        const classGroups = res.ok ? await res.json() : []

        return {
            props: { initialClassGroups: classGroups, session },
        }
    } catch (error) {
        console.error('Failed to fetch initial class groups on server:', error);
        return {
            props: { initialClassGroups: [], session, error: 'ไม่สามารถโหลดข้อมูลเริ่มต้นได้' },
        }
    }
}