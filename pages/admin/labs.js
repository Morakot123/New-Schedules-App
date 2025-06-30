import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import Alert from '../../components/Alert' // Assuming you have a reusable Alert component

// ---
// 1. Component Logic and State
// ---

export default function LabAdminPage() {
    const [labs, setLabs] = useState([])
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(true) // Initial loading state for data fetch
    const [isAdding, setIsAdding] = useState(false) // Loading state for adding a lab
    const [isDeleting, setIsDeleting] = useState(null) // State to track which lab is being deleted
    const [alert, setAlert] = useState(null) // Unified state for success/error alerts

    // ---
    // 2. Data Fetching
    // ---

    useEffect(() => {
        const fetchLabs = async () => {
            setIsLoading(true)
            try {
                const res = await fetch('/api/admin/labs')
                if (!res.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลห้องปฏิบัติการได้')
                }
                const data = await res.json()
                setLabs(data)
            } catch (err) {
                console.error('❌ Error fetching labs:', err)
                setAlert({ type: 'error', message: err.message })
            } finally {
                setIsLoading(false)
            }
        }

        fetchLabs()
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
            const res = await fetch('/api/admin/labs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มห้องปฏิบัติการ')
            }

            const addedLab = await res.json()
            setLabs((prevLabs) => [...prevLabs, addedLab]) // Optimistically update the list
            setName('') // Clear the input
            setAlert({ type: 'success', message: `✅ เพิ่มห้องปฏิบัติการ "${addedLab.name}" สำเร็จ` })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบห้องปฏิบัติการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
            return
        }

        setIsDeleting(id)
        setAlert(null)

        try {
            const res = await fetch(`/api/admin/labs/${id}`, { method: 'DELETE' })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการลบห้องปฏิบัติการ')
            }

            setLabs((prevLabs) => prevLabs.filter((lab) => lab.id !== id))
            setAlert({ type: 'success', message: '🗑️ ลบห้องปฏิบัติการสำเร็จ' })
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
                    <span className="bg-gradient-to-r from-purple-500 to-fuchsia-600 bg-clip-text text-transparent">
                        🧪 จัดการห้องปฏิบัติการ
                    </span>
                </h1>

                <div className="mx-auto max-w-2xl">
                    {alert && <Alert type={alert.type} message={alert.message} dismissible onClose={() => setAlert(null)} />}

                    {/* Add Lab Form */}
                    <form onSubmit={handleAdd} className="form-box mb-8 animate-fade-in-up">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                เพิ่มชื่อห้องปฏิบัติการใหม่
                            </label>
                            <div className="flex gap-3">
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="เช่น Lab A"
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

                    {/* Labs List */}
                    <div className="table-container animate-fade-in-up">
                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <div className="spinner-loader"></div>
                                <p className="ml-3 text-gray-500">กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : labs.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">
                                <p>ยังไม่มีห้องปฏิบัติการในระบบ</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อห้อง</th>
                                        <th className="text-right">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labs.map((lab) => (
                                        <tr key={lab.id}>
                                            <td>{lab.name}</td>
                                            <td className="action-cell">
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleDelete(lab.id)}
                                                    disabled={isDeleting === lab.id}
                                                >
                                                    {isDeleting === lab.id ? (
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