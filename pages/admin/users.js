import { useEffect, useState } from 'react'
import { useSession, getSession } from 'next-auth/react'
import Layout from '../../components/Layout'
import Alert from '../../components/Alert' // Assuming you have a reusable Alert component

// ---
// 1. Component Logic and State
// ---

export default function ManageUsers() {
    const { data: session, status } = useSession()

    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true) // Initial loading state for data fetch
    const [savingId, setSavingId] = useState(null) // State to track which user is being updated
    const [alert, setAlert] = useState(null) // Unified state for success/error alerts

    // ---
    // 2. Data Fetching
    // ---

    useEffect(() => {
        // Fetch users only after the session has been loaded and the user is an admin
        if (status === 'loading' || session?.user?.role !== 'admin') {
            return
        }

        const fetchUsers = async () => {
            setIsLoading(true)
            setAlert(null) // Clear previous alerts
            try {
                const res = await fetch('/api/admin/users')
                if (!res.ok) {
                    throw new Error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้')
                }
                const data = await res.json()
                setUsers(data)
            } catch (err) {
                console.error('❌ Error fetching users:', err)
                setAlert({ type: 'error', message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้' })
            } finally {
                setIsLoading(false)
            }
        }

        fetchUsers()
    }, [session, status]) // Re-run effect when session or its status changes

    // ---
    // 3. Role Change Handler
    // ---

    const handleRoleChange = async (id, newRole) => {
        if (!confirm(`คุณต้องการเปลี่ยนบทบาทของผู้ใช้เป็น "${newRole}" ใช่หรือไม่?`)) {
            return
        }

        setSavingId(id) // Set the saving state for the specific user
        setAlert(null) // Clear previous alerts

        try {
            const res = await fetch(`/api/admin/users/${id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการอัปเดตบทบาท')
            }

            // Optimistically update the local state with the new role
            setUsers((prevUsers) => prevUsers.map((u) => (u.id === id ? { ...u, role: newRole } : u)))
            setAlert({ type: 'success', message: `✅ เปลี่ยนบทบาทสำเร็จ!` })
        } catch (err) {
            setAlert({ type: 'error', message: err.message })
        } finally {
            setSavingId(null) // Reset the saving state
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

    // Unauthorized access message
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

    // Main content for admins
    return (
        <Layout>
            <div className="main-content-container">
                <h1 className="page-title text-center">
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                        🔐 จัดการผู้ใช้
                    </span>
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                    จัดการบทบาทของผู้ใช้แต่ละคนในระบบ
                </p>

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
                        ) : users.length === 0 ? (
                            <div className="py-10 text-center text-gray-500">
                                <p>ยังไม่มีผู้ใช้ในระบบ</p>
                            </div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>ชื่อ</th>
                                        <th>อีเมล</th>
                                        <th>บทบาท</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-medium text-gray-900 dark:text-gray-100">{user.name || '-'}</td>
                                            <td>{user.email}</td>
                                            <td className="w-[150px] relative">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    disabled={savingId === user.id}
                                                    className="form-select"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="teacher">Teacher</option>
                                                </select>
                                                {savingId === user.id && (
                                                    <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center rounded-lg">
                                                        <div className="spinner-sm"></div>
                                                    </div>
                                                )}
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
    const session = await getSession(context)

    if (!session || session.user.role !== 'admin') {
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