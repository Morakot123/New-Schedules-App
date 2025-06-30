// pages/students.js
import { getSession } from 'next-auth/react'
import { useState, useCallback } from 'react'
import Layout from '../components/Layout'
import Head from 'next/head'
import { PlusCircleIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function StudentsPage({ session, students: initialStudents, classGroups }) {
    const [students, setStudents] = useState(initialStudents)
    const [form, setForm] = useState({ name: '', classGroupId: '' })
    const [status, setStatus] = useState('idle') // 'idle' | 'adding' | 'deleting' | 'error' | 'success'
    const [loadingStudents, setLoadingStudents] = useState(false)

    // 1. Centralize the data fetching logic using useCallback for memoization
    const refreshStudents = useCallback(async () => {
        setLoadingStudents(true)
        try {
            const res = await fetch('/api/students')
            if (!res.ok) throw new Error('Failed to fetch students.')
            const data = await res.json()
            setStudents(data)
        } catch (err) {
            console.error('Failed to fetch students:', err)
            alert('ไม่สามารถโหลดข้อมูลนักเรียนได้. โปรดลองอีกครั้ง.')
        } finally {
            setLoadingStudents(false)
        }
    }, [])

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('adding')

        if (!form.name.trim() || !form.classGroupId) {
            setStatus('error')
            alert('กรุณากรอกข้อมูลให้ครบถ้วนก่อนเพิ่มนักเรียน.')
            return
        }

        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    classGroupId: Number(form.classGroupId),
                }),
            })
            if (!res.ok) throw new Error('API request failed.')

            setForm({ name: '', classGroupId: '' }) // Reset form fields
            await refreshStudents() // Refresh the list after successful addition
            setStatus('success')
        } catch (err) {
            console.error('Failed to add student:', err)
            setStatus('error')
            alert('เกิดข้อผิดพลาดในการเพิ่มนักเรียน. กรุณาลองใหม่อีกครั้ง.')
        }
    }

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบนักเรียนคนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้.')
        if (!confirmDelete) return

        setStatus('deleting')
        try {
            const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('API request failed.')

            await refreshStudents() // Refresh the list after successful deletion
            setStatus('success')
        } catch (err) {
            console.error('Failed to delete student:', err)
            setStatus('error')
            alert('เกิดข้อผิดพลาดในการลบนักเรียน. โปรดตรวจสอบการเชื่อมต่อและลองใหม่.')
        }
    }

    return (
        <Layout>
            <Head>
                {/* 2. Add meta tags for SEO */}
                <title>จัดการนักเรียน - Lab Scheduler</title>
                <meta name="description" content="จัดการข้อมูลนักเรียนและชั้นเรียนในระบบ Lab Scheduler." />
            </Head>
            <div className="page-container max-w-4xl mx-auto py-12 px-6">
                <h1 className="page-title text-4xl font-extrabold text-blue-700 dark:text-blue-400 mb-8 text-center">
                    🎓 จัดการนักเรียน
                </h1>

                {/* 3. Modern form for adding a new student */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">เพิ่มนักเรียนใหม่</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ชื่อ - สกุล
                            </label>
                            <input
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                placeholder="เช่น นายสมชาย ใจดี"
                                required
                                disabled={status === 'adding'}
                                className="input-field"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <label htmlFor="classGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                ชั้นเรียน
                            </label>
                            <select
                                id="classGroup"
                                name="classGroupId"
                                value={form.classGroupId}
                                onChange={handleFormChange}
                                required
                                disabled={status === 'adding'}
                                className="input-field"
                            >
                                <option value="">-- เลือกชั้นเรียน --</option>
                                {classGroups.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full sm:w-auto mt-4 sm:mt-0 px-8"
                            disabled={status === 'adding'}
                        >
                            {status === 'adding' ? (
                                <span className="flex items-center">
                                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                                    กำลังเพิ่ม...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                                    เพิ่มนักเรียน
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* 4. Student list table with loading and empty states */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    รายชื่อนักเรียนทั้งหมด ({students.length})
                </h2>
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    {loadingStudents ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                            <p className="ml-4 text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p className="text-lg">— ยังไม่มีนักเรียนในระบบ —</p>
                            <p className="mt-2 text-sm">ใช้ฟอร์มด้านบนเพื่อเพิ่มนักเรียนคนแรก</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="table-th">ชื่อ</th>
                                    <th scope="col" className="table-th">ชั้นเรียน</th>
                                    <th scope="col" className="table-th text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {students.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="table-td font-medium text-gray-900 dark:text-white">{s.name}</td>
                                        <td className="table-td text-gray-600 dark:text-gray-300">
                                            {s.classGroup?.name ?? 'ไม่มีชั้นเรียน'}
                                        </td>
                                        <td className="table-td text-center">
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                disabled={status === 'deleting'}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500 transition-colors"
                                                title="ลบนักเรียน"
                                            >
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
            {/* 5. Centralized Tailwind CSS styles for tables and forms */}
            <style jsx global>{`
                .table-th {
                    padding: 12px 24px;
                    text-align: left;
                    font-size: 0.75rem; /* text-xs */
                    font-weight: 700; /* font-bold */
                    text-transform: uppercase;
                    letter-spacing: 0.05em; /* tracking-wider */
                    color: var(--color-gray-600);
                }
                .dark .table-th {
                    color: var(--color-gray-300);
                }
                .table-td {
                    padding: 16px 24px;
                    white-space: nowrap;
                    font-size: 0.875rem; /* text-sm */
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

    // 6. Redirect unauthorized users to an access denied page
    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/access-denied',
                permanent: false,
            },
        }
    }

    try {
        const students = await prisma.student.findMany({
            include: { classGroup: true },
            orderBy: { name: 'asc' }, // 7. Order the list alphabetically
        })
        const classGroups = await prisma.classGroup.findMany({
            orderBy: { name: 'asc' }, // Order class groups
        })

        return {
            props: {
                session,
                students: JSON.parse(JSON.stringify(students)), // 8. Serialize data for Next.js
                classGroups: JSON.parse(JSON.stringify(classGroups)),
            },
        }
    } catch (error) {
        console.error('Failed to fetch data from Prisma:', error)
        // 9. Handle database errors gracefully
        return {
            props: {
                session,
                students: [],
                classGroups: [],
                error: 'Failed to load data. Please try again later.'
            },
        }
    } finally {
        await prisma.$disconnect()
    }
}