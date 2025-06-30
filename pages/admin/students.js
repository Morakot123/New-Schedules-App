import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert' // Assuming you have a reusable Alert component
import { getSession } from 'next-auth/react' // Keep for getServerSideProps

// ---
// 1. Component Logic and State
// ---

export default function ManageStudents() {
    const { data: session, status } = useSession() // Get loading status from useSession

    const [students, setStudents] = useState([])
    const [isLoading, setIsLoading] = useState(true) // Initial loading state for data fetch
    const [isDeleting, setIsDeleting] = useState(null) // State to track which student is being deleted
    const [alert, setAlert] = useState(null) // Unified state for success/error alerts

    // ---
    // 2. Data Fetching
    // ---

    useEffect(() => {
        // Only fetch if session status is not loading
        if (status === 'loading') return;

        const fetchStudents = async () => {
            setIsLoading(true)
            setAlert(null) // Clear any previous alerts
            try {
                const res = await fetch('/api/admin/students')
                if (!res.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลนักเรียนได้')
                }
                const data = await res.json()
                setStudents(data)
            } catch (err) {
                console.error('❌ Error fetching students:', err)
                setAlert({ type: 'error', message: err.message })
            } finally {
                setIsLoading(false)
            }
        }

        fetchStudents()
    }, [status]) // Depend on status to re-fetch after session loads

    // ---
    // 3. Delete Handler
    // ---

    const handleDelete = async (id, name) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบนักเรียน "${name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
            return
        }

        setIsDeleting(id) // Set loading state for the specific item
        setAlert(null) // Clear previous alerts

        try {
            const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการลบนักเรียน')
            }

            // Optimistically update the UI by filtering out the deleted student
            setStudents((prevStudents) => prevStudents.filter((student) => student.id !== id))
            setAlert({ type: 'success', message: `🗑️ ลบนักเรียน "${name}" สำเร็จ` })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setIsDeleting(null) // Reset loading state
        }
    }

    // ---
    // 4. Render UI based on state and user role
    // ---

    // Show a loading state while fetching user session
    if (status === 'loading') {
        return (
            <Layout>
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6 h-16 w-16 animate-spin rounded-full border-4 border-solid border-emerald-500 border-t-transparent"></div>
                        <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูลผู้ใช้...</p>
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
                <div className="page-header flex items-center justify-between flex-wrap gap-4 mb-8">
                    <h1 className="page-title text-center lg:text-left flex-grow">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            👨‍🎓 จัดการนักเรียน
                        </span>
                    </h1>
                    <Link href="/admin/students/create" className="btn btn-primary whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        เพิ่มนักเรียน
                    </Link>
                </div>

                <div className="mx-auto max-w-4xl">
                    {alert && (
                        <div className="mb-6">
                            <Alert type={alert.type} message={alert.message} dismissible onClose={() => setAlert(null)} />
                        </div>
                    )}

                    <div className="table-container animate-fade-in-up">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="spinner-loader"></div>
                                <p className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">
                                <p>ยังไม่มีนักเรียนในระบบ</p>
                                <p className="mt-2 text-sm">
                                    คุณสามารถ <Link href="/admin/students/create" className="text-blue-500 hover:underline">เพิ่มนักเรียนใหม่</Link> ได้เลย
                                </p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อ</th>
                                        <th>กลุ่มเรียน</th>
                                        <th className="text-right">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((s) => (
                                        <tr key={s.id}>
                                            <td className="font-medium text-gray-900 dark:text-gray-100">{s.name}</td>
                                            <td>{s.classGroup?.name || '-'}</td>
                                            <td className="action-cell flex justify-end items-center space-x-2">
                                                <Link
                                                    href={`/admin/students/${s.id}`}
                                                    className="btn btn-accent btn-sm"
                                                    title="แก้ไขข้อมูลนักเรียน"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    <span className="ml-1">แก้ไข</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(s.id, s.name)}
                                                    className="btn btn-danger btn-sm"
                                                    disabled={isDeleting === s.id}
                                                    title={`ลบนักเรียน ${s.name}`}
                                                >
                                                    {isDeleting === s.id ? (
                                                        <div className="spinner-sm"></div>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            <span className="ml-1">ลบ</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

// ---
// 🔐 Server-Side Authentication
// ---

// This function runs on the server before the component is rendered.
// It ensures that only 'admin' users can access this page.
export async function getServerSideProps(context) {
    const session = await getSession(context) // Get the session from the request context

    // If there's no session or the user's role is not 'admin', redirect them
    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/denied', // Redirect to an access denied page
                permanent: false, // This is a temporary redirect
            },
        }
    }

    // If the user is an admin, pass the session as props to the component
    return {
        props: { session },
    }
}