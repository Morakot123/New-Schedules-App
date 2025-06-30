import { getSession } from 'next-auth/react'
import { useState, useCallback } from 'react'
import Layout from '../components/Layout'
import Head from 'next/head'
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function TeachersPage({ session, teachers: initialTeachers }) {
    const [teachers, setTeachers] = useState(initialTeachers)
    const [name, setName] = useState('')
    const [editId, setEditId] = useState(null)
    const [filter, setFilter] = useState('')
    const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'deleting' | 'error' | 'success'
    const [isLoading, setIsLoading] = useState(false)

    // 1. Centralized data fetching logic with loading and error states
    const refreshTeachers = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/teachers')
            if (!res.ok) throw new Error('Failed to fetch teachers.')
            const data = await res.json()
            setTeachers(data)
        } catch (err) {
            console.error('Failed to fetch teachers:', err)
            // Use a more subtle notification system if available, or a simple alert
            alert('ไม่สามารถโหลดข้อมูลครูได้. โปรดลองใหม่อีกครั้ง.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('submitting')

        if (!name.trim()) {
            alert('กรุณากรอกชื่อครู')
            setStatus('idle')
            return
        }

        try {
            const method = editId ? 'PUT' : 'POST'
            const url = editId ? `/api/teachers/${editId}` : '/api/teachers'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            })
            if (!res.ok) throw new Error('API request failed.')

            setName('')
            setEditId(null)
            await refreshTeachers() // Refresh the list after success
            setStatus('success')
        } catch (err) {
            console.error('Submission failed:', err)
            setStatus('error')
            alert(`เกิดข้อผิดพลาดในการ${editId ? 'แก้ไข' : 'เพิ่ม'}ข้อมูล. กรุณาลองใหม่อีกครั้ง.`)
        }
    }

    const handleEdit = (teacher) => {
        setName(teacher.name)
        setEditId(teacher.id)
    }

    const handleCancel = () => {
        setName('')
        setEditId(null)
    }

    const handleDelete = async (id) => {
        const ok = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบครูท่านนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้.')
        if (!ok) return

        setStatus('deleting')
        try {
            const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('API request failed.')

            await refreshTeachers() // Refresh the list after success
            setStatus('success')
        } catch (err) {
            console.error('Deletion failed:', err)
            setStatus('error')
            alert('ไม่สามารถลบครูได้. โปรดตรวจสอบว่าครูไม่มีการจองที่ค้างอยู่.')
        }
    }

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <Layout>
            <Head>
                {/* 2. Add meta tags for SEO */}
                <title>จัดการครู - Lab Scheduler</title>
                <meta name="description" content="หน้าสำหรับจัดการรายชื่อครูผู้สอนในระบบ Lab Scheduler." />
            </Head>
            <div className="page-container max-w-4xl mx-auto py-12 px-6">
                <h1 className="page-title text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-8 text-center">
                    👩‍🏫 จัดการครู
                </h1>

                {/* 3. Modern form for adding/editing */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {editId ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                            <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ชื่อครู
                            </label>
                            <input
                                id="teacherName"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="ชื่อครู"
                                required
                                disabled={status === 'submitting'}
                                className="input-field"
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full sm:w-auto mt-4 sm:mt-0 px-8"
                            disabled={status === 'submitting'}
                        >
                            {status === 'submitting' ? (
                                <span className="flex items-center">
                                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                                    กำลังบันทึก...
                                </span>
                            ) : editId ? (
                                <span className="flex items-center">
                                    <PencilSquareIcon className="h-5 w-5 mr-2" />
                                    บันทึกการแก้ไข
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                                    เพิ่มครู
                                </span>
                            )}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn btn-secondary w-full sm:w-auto mt-2 sm:mt-0 px-8"
                            >
                                <XMarkIcon className="h-5 w-5 mr-1" />
                                ยกเลิก
                            </button>
                        )}
                    </form>
                </div>

                {/* 4. Search and list section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        รายชื่อครูทั้งหมด ({teachers.length})
                    </h2>
                    <div className="relative w-full md:w-1/2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="search"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            placeholder="ค้นหาชื่อครู..."
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                {/* 5. Teacher list table with loading and empty states */}
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                            <p className="ml-4 text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : filteredTeachers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p className="text-lg">— ไม่พบครูที่ตรงกับคำค้น —</p>
                            <p className="mt-2 text-sm">ลองค้นหาด้วยชื่ออื่นหรือเพิ่มครูใหม่</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="table-th w-auto">ชื่อ</th>
                                    <th scope="col" className="table-th w-24 text-center">แก้ไข</th>
                                    <th scope="col" className="table-th w-24 text-center">ลบ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredTeachers.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="table-td font-medium text-gray-900 dark:text-white">{t.name}</td>
                                        <td className="table-td text-center">
                                            <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 transition-colors" title="แก้ไข">
                                                <PencilSquareIcon className="h-5 w-5 inline" />
                                            </button>
                                        </td>
                                        <td className="table-td text-center">
                                            <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500 transition-colors" title="ลบ">
                                                <TrashIcon className="h-5 w-5 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {/* 6. Centralized Tailwind CSS styles for tables and forms */}
            <style jsx global>{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--color-gray-300);
                    border-radius: 0.5rem;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    background-color: var(--color-white);
                    color: var(--color-gray-900);
                    transition: all 0.2s;
                }
                .dark .input-field {
                    background-color: var(--color-gray-900);
                    border-color: var(--color-gray-600);
                    color: var(--color-white);
                }
                .input-field:focus {
                    outline: none;
                    border-color: transparent;
                    box-shadow: 0 0 0 2px var(--color-blue-500);
                }
                .table-th {
                    padding: 12px 24px;
                    text-align: left;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--color-gray-600);
                }
                .dark .table-th {
                    color: var(--color-gray-300);
                }
                .table-td {
                    padding: 16px 24px;
                    font-size: 0.875rem;
                }
            `}</style>
        </Layout>
    )
}

// 🔐 Server-side authorization check before rendering
export async function getServerSideProps(context) {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const session = await getSession(context)

    // 7. Redirect unauthorized users to an access denied page for clarity
    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        }
    }

    try {
        const teachers = await prisma.teacher.findMany({
            orderBy: { name: 'asc' }, // Order the list alphabetically
        })

        return {
            props: {
                session,
                teachers: JSON.parse(JSON.stringify(teachers)), // 8. Serialize data for Next.js
            },
        }
    } catch (error) {
        console.error('Failed to fetch data from Prisma:', error)
        // 9. Handle database errors gracefully
        return {
            props: {
                session,
                teachers: [],
                error: 'Failed to load data. Please try again later.'
            },
        }
    } finally {
        await prisma.$disconnect()
    }
}