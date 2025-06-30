import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ManageTeachersForm from '../../components/ManageTeachersForm';
import ManageGradesForm from '../../components/ManageGradesForm';
import ManageTimeSlotsForm from '../../components/ManageTimeSlotsForm';

export default function AdminSchedulesPage() {
    const { data: session, status } = useSession();
    const [teachers, setTeachers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [teachersRes, gradesRes, timeSlotsRes] = await Promise.all([
                fetch('/api/teachers'),
                fetch('/api/grades'),
                fetch('/api/time-slots'),
            ]);
            const [teachersData, gradesData, timeSlotsData] = await Promise.all([
                teachersRes.json(),
                gradesRes.json(),
                timeSlotsRes.json(),
            ]);
            setTeachers(teachersData);
            setGrades(gradesData);
            setTimeSlots(timeSlotsData);
        } catch (error) {
            console.error('Error fetching data for management page:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (status === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    // Protect the route
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center text-red-600 dark:text-red-400">
                <p className="text-2xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto dark:text-white">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-10 text-center">
                หน้าจัดการข้อมูลพื้นฐาน
            </h2>

            {loading ? (
                <p className="text-center text-xl text-gray-500">กำลังโหลดข้อมูล...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ManageTeachersForm onTeacherUpdate={fetchData} />
                    <ManageGradesForm onGradeUpdate={fetchData} />
                    <ManageTimeSlotsForm onTimeSlotUpdate={fetchData} />
                </div>
            )}
        </div>
    );
}