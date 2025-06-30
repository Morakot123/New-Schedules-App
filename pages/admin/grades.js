import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ManageGradesForm from '../../components/ManageGradesForm';

export default function AdminGradesPage() {
    const { data: session, status } = useSession();
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/grades');
            const data = await response.json();
            setGrades(data);
        } catch (error) {
            console.error('Error fetching grades:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบชั้นเรียนนี้?')) {
            try {
                const response = await fetch(`/api/grades?id=${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete grade');
                alert('ลบข้อมูลสำเร็จ!');
                fetchData(); // Refresh list
            } catch (error) {
                console.error('Error deleting grade:', error);
                alert('เกิดข้อผิดพลาดในการลบข้อมูล');
            }
        }
    };

    if (status === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center text-red-600 dark:text-red-400">
                <p className="text-2xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto dark:text-white">
            <h2 className="text-4xl font-bold mb-8 text-center">จัดการข้อมูลชั้นเรียน</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form to Add/Edit Grade */}
                <ManageGradesForm onGradeUpdate={fetchData} />

                {/* List of Grades */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">รายการชั้นเรียนทั้งหมด</h3>
                    {loading ? (
                        <p className="text-center text-gray-500">กำลังโหลด...</p>
                    ) : grades.length === 0 ? (
                        <p className="text-center text-gray-500">ยังไม่มีข้อมูลชั้นเรียน</p>
                    ) : (
                        <ul className="space-y-3">
                            {grades.map((grade) => (
                                <li key={grade.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm">
                                    <span className="font-medium text-gray-900 dark:text-white">{grade.name}</span>
                                    <button onClick={() => handleDelete(grade.id)} className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition">
                                        ลบ
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}