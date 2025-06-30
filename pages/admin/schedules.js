// pages/admin/schedules.js
import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
// ไม่ต้อง import Layout ที่นี่ เพราะ _app.js จัดการ Layout หลักแล้ว
import Alert from '../../components/Alert'; // ตรวจสอบว่ามี Alert component

export default function AdminSchedulesPage() {
    const { data: session, status: sessionStatus } = useSession();
    const [schedules, setSchedules] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [labs, setLabs] = useState([]);
    const [classGroups, setClassGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form states for adding new schedule
    const [newSchedule, setNewSchedule] = useState({
        subject: '',
        time: '',
        day: '',
        teacherId: '',
        labId: '',
        classGroupId: '',
    });

    const [editingSchedule, setEditingSchedule] = useState(null); // State to hold schedule being edited

    const fetchDropdownData = async () => {
        try {
            const [teachersRes, labsRes, classGroupsRes] = await Promise.all([
                fetch('/api/teachers'),
                fetch('/api/rooms'), // Assuming /api/rooms returns lab data
                fetch('/api/class-groups'),
            ]);

            const teachersData = await teachersRes.json();
            const labsData = await labsRes.json();
            const classGroupsData = await classGroupsRes.json();

            setTeachers(teachersData);
            setLabs(labsData);
            setClassGroups(classGroupsData);
        } catch (err) {
            console.error('Error fetching dropdown data:', err);
            setError('Failed to load form data.');
        }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/admin/schedules'); // Endpoint สำหรับ admin schedule
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch schedules.');
            }
            const data = await response.json();
            setSchedules(data);
        } catch (err) {
            console.error('Error fetching schedules:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการโหลดตารางเรียน');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            fetchDropdownData();
            fetchSchedules();
        }
    }, [sessionStatus]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewSchedule(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // Basic validation
        if (!newSchedule.subject || !newSchedule.time || !newSchedule.day ||
            !newSchedule.teacherId || !newSchedule.labId || !newSchedule.classGroupId) {
            setError('Please fill in all fields.');
            setSubmitting(false);
            return;
        }

        try {
            const method = editingSchedule ? 'PUT' : 'POST';
            const url = editingSchedule ? `/api/admin/schedules?id=${editingSchedule.id}` : '/api/admin/schedules';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save schedule.');
            }

            setSuccess(editingSchedule ? 'อัปเดตตารางเรียนสำเร็จ!' : 'เพิ่มตารางเรียนสำเร็จ!');
            setNewSchedule({
                subject: '', time: '', day: '', teacherId: '', labId: '', classGroupId: ''
            });
            setEditingSchedule(null); // Clear editing state
            fetchSchedules(); // Re-fetch schedules
        } catch (err) {
            console.error('Error saving schedule:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกตารางเรียน');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setNewSchedule({
            subject: schedule.subject,
            time: schedule.time,
            day: schedule.day,
            teacherId: String(schedule.teacherId), // Convert to string for select input
            labId: String(schedule.labId),
            classGroupId: String(schedule.classGroupId),
        });
        setError(null);
        setSuccess(null);
    };

    const handleCancelEdit = () => {
        setEditingSchedule(null);
        setNewSchedule({
            subject: '', time: '', day: '', teacherId: '', labId: '', classGroupId: ''
        });
        setError(null);
        setSuccess(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบตารางเรียนนี้?')) return;
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`/api/admin/schedules?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete schedule.');
            }
            setSuccess('ลบตารางเรียนสำเร็จ!');
            fetchSchedules(); // Re-fetch schedules
        } catch (err) {
            console.error('Error deleting schedule:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการลบตารางเรียน');
        } finally {
            setSubmitting(false);
        }
    };


    // Authentication check
    if (sessionStatus === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    if (sessionStatus === 'unauthenticated' || session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen p-8 text-center bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400">
                <p className="text-2xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        // เนื้อหาของหน้านี้จะถูกห่อหุ้มด้วย Layout ใน pages/_app.js อยู่แล้ว
        // ดังนั้นไม่จำเป็นต้องใช้ <Layout> ที่นี่
        <div className="main-content-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
            <h1 className="page-title text-center mb-8">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    🗓️ จัดการตารางเรียน (Admin)
                </span>
            </h1>

            {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}
            {success && <Alert type="success" message={success} dismissible onClose={() => setSuccess(null)} />}

            <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {editingSchedule ? 'แก้ไขตารางเรียน' : 'เพิ่มตารางเรียนใหม่'}
                </h2>
                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">วิชา</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={newSchedule.subject}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={submitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">เวลา</label>
                        <input
                            type="text"
                            id="time"
                            name="time"
                            value={newSchedule.time}
                            onChange={handleChange}
                            placeholder="เช่น 09:00-10:00"
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={submitting}
                        />
                    </div>
                    <div>
                        <label htmlFor="day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">วัน</label>
                        <select
                            id="day"
                            name="day"
                            value={newSchedule.day}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={submitting}
                        >
                            <option value="">เลือกวัน</option>
                            {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ครูผู้สอน</label>
                        <select
                            id="teacherId"
                            name="teacherId"
                            value={newSchedule.teacherId}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={submitting}
                        >
                            <option value="">เลือกครู</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="labId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ห้องปฏิบัติการ</label>
                        <select
                            id="labId"
                            name="labId"
                            value={newSchedule.labId}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={submitting}
                        >
                            <option value="">เลือกห้อง</option>
                            {labs.map(lab => (
                                <option key={lab.id} value={lab.id}>
                                    {lab.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="classGroupId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">กลุ่มชั้นเรียน</label>
                        <select
                            id="classGroupId"
                            name="classGroupId"
                            value={newSchedule.classGroupId}
                            onChange={handleChange}
                            className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            disabled={submitting}
                        >
                            <option value="">เลือกกลุ่ม</option>
                            {classGroups.map(group => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                            disabled={submitting}
                        >
                            {submitting ? 'กำลังบันทึก...' : (editingSchedule ? 'บันทึกการแก้ไข' : 'เพิ่มตารางเรียน')}
                        </button>
                        {editingSchedule && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50"
                                disabled={submitting}
                            >
                                ยกเลิก
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="max-w-4xl mx-auto mt-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">ตารางเรียนทั้งหมด</h2>
                {loading ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">กำลังโหลดตารางเรียน...</p>
                ) : schedules.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">ไม่มีตารางเรียนในระบบ</p>
                ) : (
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วิชา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วัน</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ครู</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ห้อง</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">กลุ่มชั้นเรียน</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {schedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{schedule.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{schedule.time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{schedule.day}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{schedule.teacher?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{schedule.lab?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{schedule.classGroup?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition disabled:opacity-50"
                                                disabled={submitting}
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                className="ml-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
                                                disabled={submitting}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// getServerSideProps เพื่อตรวจสอบสิทธิ์ Admin ฝั่งเซิร์ฟเวอร์
export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/denied',
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
}
