import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import Alert from '../../components/Alert' // Assuming you have a reusable Alert component

// ---
// 1. Component Logic and State
// ---

export default function TeacherAdminPage() {
    const [teachers, setTeachers] = useState([])
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(true) // Initial loading state for data fetch
    const [isAdding, setIsAdding] = useState(false) // Loading state for adding a teacher
    const [isDeleting, setIsDeleting] = useState(null) // State to track which teacher is being deleted
    const [alert, setAlert] = useState(null) // Unified state for success/error alerts

    // ---
    // 2. Data Fetching
    // ---

    useEffect(() => {
        const fetchTeachers = async () => {
            setIsLoading(true)
            setAlert(null) // Clear any previous alerts
            try {
                const res = await fetch('/api/admin/teachers')
                if (!res.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลครูผู้สอนได้')
                }
                const data = await res.json()
                setTeachers(data)
            } catch (err) {
                console.error('❌ Error fetching teachers:', err)
                setAlert({ type: 'error', message: err.message })
            } finally {
                setIsLoading(false)
            }
        }

        fetchTeachers()
    }, [])

    // ---
    // 3. Handlers for Add and Delete Actions
    // ---

    const handleAdd = async (e) => {
        e.preventDefault()
        const trimmedName = name.trim()
        if (!trimmedName) return

        setIsAdding(true)
        setAlert(null) // Clear any previous alerts

        try {
            const res = await fetch('/api/admin/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มครูผู้สอน')
            }

            const addedTeacher = await res.json()
            setTeachers((prevTeachers) => [...prevTeachers, addedTeacher]) // Optimistically update the list
            setName('') // Clear the input
            setAlert({ type: 'success', message: `✅ เพิ่มครูผู้สอน "${addedTeacher.name}" สำเร็จ` })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (id, teacherName) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบครูผู้สอน "${teacherName}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
            return
        }

        setIsDeleting(id)
        setAlert(null)

        try {
            const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการลบครูผู้สอน')
            }

            setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== id))
            setAlert({ type: 'success', message: `🗑️ ลบครูผู้สอน "${teacherName}" สำเร็จ` })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setIsDeleting(null)
        }
    }

    // ---
    // 4. Render UI based on state
    // ---

    return (
        <Layout>
            <div className="main-content-container">
                <h1 className="page-title text-center">
                    <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                        👩‍🏫 จัดการครูผู้สอน
                    </span>
                </h1>

                <div className="mx-auto max-w-2xl">
                    {alert && <Alert type={alert.type} message={alert.message} dismissible onClose={() => setAlert(null)} />}

                    {/* Add Teacher Form */}
                    <form onSubmit={handleAdd} className="form-box mb-8 animate-fade-in-up">
                        <div className="form-group">
                            <label htmlFor="teacherName" className="form-label">
                                เพิ่มชื่อครูผู้สอนใหม่
                            </label>
                            <div className="flex gap-3">
                                <input
                                    id="teacherName"
                                    type="text"
                                    placeholder="เช่น ครูสมปอง"
                                    className="form-input flex-grow"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isAdding}
                                    required
                                />
                                <button type="submit" className="btn btn-primary min-w-[100px]" disabled={isAdding}>
                                    {isAdding ? 'กำลังเพิ่ม...' : '➕ เพิ่ม'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Teachers List */}
                    <div className="table-container animate-fade-in-up">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="spinner-loader"></div>
                                <p className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : teachers.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">
                                <p>ยังไม่มีข้อมูลครูผู้สอนในระบบ</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อครู</th>
                                        <th className="text-right">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teachers.map((t) => (
                                        <tr key={t.id}>
                                            <td>{t.name}</td>
                                            <td className="action-cell">
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(t.id, t.name)}
                                                    disabled={isDeleting === t.id}
                                                >
                                                    {isDeleting === t.id ? (
                                                        <div className="spinner-sm"></div>
                                                    ) : (
                                                        '🗑 ลบ'
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

export async function getServerSideProps(context) {
    const session = await getSession(context)

    if (!session || session.user.role !== 'admin') {
        // Redirect to a custom "denied" page or login page
        return {
            redirect: {
                destination: '/denied',
                permanent: false,
            },
        }
    }

    return {
        props: { session },
    }
}