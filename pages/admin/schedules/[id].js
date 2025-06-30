import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Layout from '../../../components/Layout'
import Alert from '../../../components/Alert' // Import the improved Alert component

// ---
// 1. Component Logic and State
// ---

export default function EditSchedule() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { id } = router.query

    const [form, setForm] = useState({
        subject: '',
        time: '',
        teacherId: '',
        classGroupId: '',
        labId: '',
    })

    const [teachers, setTeachers] = useState([])
    const [groups, setGroups] = useState([])
    const [labs, setLabs] = useState([])
    const [loading, setLoading] = useState(true) // Initial loading state for data fetch
    const [formSubmitting, setFormSubmitting] = useState(false) // Separate state for form submission
    const [alertMessage, setAlertMessage] = useState('')
    const [alertType, setAlertType] = useState('info')

    // ---
    // 2. Data Fetching
    // ---

    useEffect(() => {
        if (!id || status === 'loading') return

        const fetchData = async () => {
            try {
                // Fetch schedule data
                const scheduleRes = await fetch(`/api/admin/schedules/${id}`)
                const scheduleData = await scheduleRes.json()

                if (!scheduleRes.ok) {
                    throw new Error(scheduleData.message || 'Failed to fetch schedule data.')
                }

                setForm({
                    subject: scheduleData.subject || '',
                    time: scheduleData.time || '',
                    teacherId: scheduleData.teacherId?.toString() || '',
                    classGroupId: scheduleData.classGroupId?.toString() || '',
                    labId: scheduleData.labId?.toString() || '',
                })

                // Fetch dropdown data in parallel
                const [teachersRes, groupsRes, labsRes] = await Promise.all([
                    fetch('/api/admin/teachers/simple'),
                    fetch('/api/admin/class-groups'),
                    fetch('/api/admin/labs'),
                ])

                const [teachersData, groupsData, labsData] = await Promise.all([
                    teachersRes.json(),
                    groupsRes.json(),
                    labsRes.json(),
                ])

                setTeachers(teachersData)
                setGroups(groupsData)
                setLabs(labsData)
                setLoading(false)
            } catch (err) {
                setAlertMessage(err.message)
                setAlertType('error')
                setLoading(false)
            }
        }

        fetchData()
    }, [id, status])

    // ---
    // 3. Form Submission Handler
    // ---

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormSubmitting(true)
        setAlertMessage('') // Clear previous alerts

        try {
            const res = await fetch(`/api/admin/schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
            }

            // Show success alert and redirect
            setAlertType('success')
            setAlertMessage('✅ บันทึกข้อมูลเรียบร้อยแล้ว! กำลังนำทางกลับ...')
            setTimeout(() => {
                router.push('/admin/schedules')
            }, 1500)
        } catch (err) {
            setAlertType('error')
            setAlertMessage(err.message)
        } finally {
            setFormSubmitting(false)
        }
    }

    // ---
    // 4. Render UI based on state
    // ---

    // Show a loading state while fetching user session or data
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
                        ✏️ แก้ไขตารางเรียน
                    </span>
                </h1>
                <div className="mx-auto max-w-2xl">
                    {alertMessage && (
                        <div className="mb-6">
                            <Alert type={alertType} message={alertMessage} dismissible />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-box animate-fade-in-up">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="form-group">
                                <label htmlFor="subject" className="form-label">
                                    ชื่อวิชา
                                </label>
                                <input
                                    id="subject"
                                    type="text"
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="time" className="form-label">
                                    เวลา
                                </label>
                                <input
                                    id="time"
                                    type="text"
                                    name="time"
                                    value={form.time}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="เช่น จันทร์ 09:00-11:00"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="teacherId" className="form-label">
                                    ครูผู้สอน
                                </label>
                                <select
                                    id="teacherId"
                                    name="teacherId"
                                    value={form.teacherId}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="" disabled>-- เลือกครู --</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="classGroupId" className="form-label">
                                    กลุ่มเรียน
                                </label>
                                <select
                                    id="classGroupId"
                                    name="classGroupId"
                                    value={form.classGroupId}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="" disabled>-- เลือกกลุ่ม --</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="labId" className="form-label">
                                    ห้องแลป
                                </label>
                                <select
                                    id="labId"
                                    name="labId"
                                    value={form.labId}
                                    onChange={handleChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="" disabled>-- เลือกห้องแลป --</option>
                                    {labs.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary mt-8 w-full"
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