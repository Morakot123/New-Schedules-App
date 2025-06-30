import Layout from '../../components/Layout'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function TeacherDashboard() {
    // 1. Use the session status to manage UI state
    const { data: session, status } = useSession()
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null) // State to hold API error messages

    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์']

    // 2. Fetch data only when session is authenticated and user is a teacher
    useEffect(() => {
        // Only fetch if the session is loaded and the user is authorized
        if (status === 'authenticated' && session.user.role === 'teacher') {
            const fetchSchedules = async () => {
                setLoading(true)
                setError(null) // Clear previous errors
                try {
                    const res = await fetch('/api/teacher/schedules')
                    if (!res.ok) {
                        // Throw an error if the response is not OK (e.g., 403, 404, 500)
                        const errorData = await res.json()
                        throw new Error(errorData.message || `เกิดข้อผิดพลาด: ${res.status}`)
                    }
                    const data = await res.json()
                    setSchedules(data)
                } catch (err) {
                    // Catch network errors and API-specific errors
                    console.error('Failed to fetch schedules:', err)
                    setError(err.message || 'ไม่สามารถโหลดตารางสอนได้')
                    setSchedules([]) // Clear schedules on error
                } finally {
                    setLoading(false)
                }
            }

            fetchSchedules()
        }
    }, [session, status]) // Depend on session and status to trigger fetch

    // --- 3. Handle different UI states based on session status ---
    if (status === 'loading') {
        return (
            <Layout>
                <div className="page-container text-center py-20">
                    <p className="text-gray-400">🔄 กำลังโหลดข้อมูลผู้ใช้...</p>
                </div>
            </Layout>
        )
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'teacher') {
        return (
            <Layout>
                <div className="page-container flex flex-col items-center justify-center min-h-[50vh]">
                    <p className="text-red-600 text-center py-10 text-xl font-bold">
                        ⛔ คุณไม่มีสิทธิ์เข้าถึงหน้านี้
                    </p>
                    <p className="text-gray-500">กรุณาเข้าสู่ระบบด้วยบัญชีครูผู้สอน</p>
                </div>
            </Layout>
        )
    }

    // 4. Group schedules by day for display
    const groupedSchedules = days.map((day) => ({
        day,
        entries: schedules.filter((s) => s.day === day),
    }))

    return (
        <Layout>
            <Head>
                <title>ตารางสอน - {session.user.name}</title>
            </Head>
            <div className="page-container">
                <h1 className="page-title">🗓️ ตารางสอนของคุณ</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    ยินดีต้อนรับ, {session.user.name}
                </p>

                {/* 5. Display loading, error, or data */}
                {loading ? (
                    <p className="text-center text-gray-400 mt-6">กำลังโหลดตารางสอน...</p>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6" role="alert">
                        <strong className="font-bold">ข้อผิดพลาด! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                ) : (
                    groupedSchedules.map(({ day, entries }) => (
                        <div key={day} className="mb-10">
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4 border-b-2 border-blue-200 dark:border-blue-700 pb-2">
                                📅 {day}
                            </h2>

                            {entries.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                            <tr>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">วิชา</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">เวลา</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">กลุ่มเรียน</th>
                                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">ห้องแลป</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entries.map((s) => (
                                                <tr key={s.id} className="border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{s.subject}</td>
                                                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{s.time}</td>
                                                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{s.classGroup?.name || '-'}</td>
                                                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{s.lab?.name || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    ยังไม่มีตารางสอนสำหรับวัน{day}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Layout>
    )
}