import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react'
import Alert from '../../components/Alert' // Assuming you have a reusable Alert component
import { useRouter } from 'next/router'

// ---
// 1. Component Logic and State
// ---

export default function ClassGroupsPage() {
    const router = useRouter()

    const [classGroups, setClassGroups] = useState([])
    const [newGroupName, setNewGroupName] = useState('')
    const [isLoading, setIsLoading] = useState(true) // Initial loading state for data fetch
    const [isAdding, setIsAdding] = useState(false) // Loading state for adding a group
    const [isDeleting, setIsDeleting] = useState(null) // State to track which group is being deleted
    const [alert, setAlert] = useState(null) // Unified state for success/error alerts

    // ---
    // 2. Data Fetching
    // ---

    useEffect(() => {
        const fetchClassGroups = async () => {
            setIsLoading(true)
            try {
                const res = await fetch('/api/admin/class-groups')
                if (!res.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลกลุ่มเรียนได้')
                }
                const data = await res.json()
                setClassGroups(data)
            } catch (err) {
                console.error('❌ Error fetching class groups:', err)
                setAlert({ type: 'error', message: err.message })
            } finally {
                setIsLoading(false)
            }
        }

        fetchClassGroups()
    }, [])

    // ---
    // 3. Handlers for Add and Delete Actions
    // ---

    const handleAdd = async (e) => {
        e.preventDefault()
        const trimmedName = newGroupName.trim()
        if (!trimmedName) return

        setIsAdding(true)
        setAlert(null) // Clear any previous alerts

        try {
            const res = await fetch('/api/admin/class-groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มกลุ่มเรียน')
            }

            const addedGroup = await res.json()
            setClassGroups((prevGroups) => [...prevGroups, addedGroup]) // Optimistically update the list
            setNewGroupName('') // Clear the input
            setAlert({ type: 'success', message: `✅ เพิ่มกลุ่มเรียน "${addedGroup.name}" สำเร็จ` })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่มเรียนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
            return
        }

        setIsDeleting(id)
        setAlert(null)

        try {
            const res = await fetch(`/api/admin/class-groups/${id}`, { method: 'DELETE' })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการลบกลุ่มเรียน')
            }

            setClassGroups((prevGroups) => prevGroups.filter((group) => group.id !== id))
            setAlert({ type: 'success', message: '🗑️ ลบกลุ่มเรียนสำเร็จ' })
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
                    <span className="bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">
                        👥 จัดการกลุ่มเรียน
                    </span>
                </h1>

                <div className="mx-auto max-w-2xl">
                    {alert && <Alert type={alert.type} message={alert.message} dismissible onClose={() => setAlert(null)} />}

                    {/* Add Group Form */}
                    <form onSubmit={handleAdd} className="form-box mb-8 animate-fade-in-up">
                        <div className="form-group">
                            <label htmlFor="newGroupName" className="form-label">
                                เพิ่มกลุ่มเรียนใหม่
                            </label>
                            <div className="flex gap-3">
                                <input
                                    id="newGroupName"
                                    type="text"
                                    placeholder="เช่น ป.1/3"
                                    className="form-input flex-grow"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    disabled={isAdding}
                                    required
                                />
                                <button type="submit" className="btn btn-primary min-w-[100px]" disabled={isAdding}>
                                    {isAdding ? 'กำลังเพิ่ม...' : '➕ เพิ่ม'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Class Groups List */}
                    <div className="table-container animate-fade-in-up">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="spinner-loader"></div>
                                <p className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : classGroups.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">
                                <p>ยังไม่มีกลุ่มเรียนในระบบ</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อกลุ่ม</th>
                                        <th className="text-right">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classGroups.map((group) => (
                                        <tr key={group.id}>
                                            <td>{group.name}</td>
                                            <td className="action-cell">
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(group.id)}
                                                    disabled={isDeleting === group.id}
                                                >
                                                    {isDeleting === group.id ? (
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