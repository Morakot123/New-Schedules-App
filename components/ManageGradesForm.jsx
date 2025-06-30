// components/ManageGradesForm.js
import { useState, useEffect } from 'react';

export default function ManageGradesForm({ onGradeUpdate }) {
    const [grades, setGrades] = useState([]);
    const [newGradeName, setNewGradeName] = useState('');
    const [editingGrade, setEditingGrade] = useState(null); // เก็บอ็อบเจกต์ระดับชั้นที่กำลังแก้ไข
    const [loading, setLoading] = useState(true); // สถานะการโหลดเริ่มต้นสำหรับการดึงระดับชั้น
    const [submitting, setSubmitting] = useState(false); // สถานะสำหรับการดำเนินการเพิ่ม/อัปเดต/ลบ
    const [error, setError] = useState(null); // สถานะสำหรับแสดงข้อความข้อผิดพลาด
    const [success, setSuccess] = useState(null); // สถานะสำหรับแสดงข้อความสำเร็จ

    // --- การดึงข้อมูล ---
    // ฟังก์ชันสำหรับดึงระดับชั้นทั้งหมดจาก API
    const fetchGrades = async () => {
        setLoading(true);
        setError(null); // ล้างข้อผิดพลาดก่อนหน้า
        try {
            const response = await fetch('/api/grades');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch grades.');
            }
            const data = await response.json();
            setGrades(data); // อัปเดตรายการระดับชั้น
        } catch (err) {
            console.error('Error fetching grades:', err);
            setError(err.message); // ตั้งค่าข้อความข้อผิดพลาด
        } finally {
            setLoading(false); // สิ้นสุดสถานะการโหลด
        }
    };

    // Effect hook เพื่อดึงระดับชั้นเมื่อคอมโพเนนต์ถูกเมาท์
    useEffect(() => {
        fetchGrades();
    }, []);

    // --- การส่งฟอร์ม (เพิ่มหรืออัปเดต) ---
    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันพฤติกรรมการส่งฟอร์มเริ่มต้น
        setSubmitting(true); // เริ่มสถานะกำลังส่ง
        setError(null); // ล้างข้อผิดพลาดก่อนหน้า
        setSuccess(null); // ล้างข้อความสำเร็จก่อนหน้า

        const trimmedName = newGradeName.trim();
        // การตรวจสอบพื้นฐาน: ตรวจสอบว่าช่องป้อนข้อมูลว่างเปล่าหรือไม่หลังจากตัดช่องว่าง
        if (!trimmedName) {
            setError('Grade name cannot be empty.');
            setSubmitting(false);
            return;
        }

        try {
            let response;
            let method;
            let url;
            let bodyData = { name: trimmedName };

            if (editingGrade) {
                // ถ้า editingGrade ถูกตั้งค่า, นี่คือการดำเนินการอัปเดต (PUT)
                method = 'PUT';
                url = `/api/grades?id=${editingGrade.id}`; // ส่ง ID ใน query สำหรับการอัปเดต
                // bodyData มี { name: trimmedName } อยู่แล้ว
            } else {
                // มิฉะนั้น, นี่คือการดำเนินการเพิ่ม (POST)
                method = 'POST';
                url = '/api/grades';
                // bodyData มี { name: trimmedName } อยู่แล้ว
            }

            // ส่ง request ไปยัง API
            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                // หาก Response ไม่ใช่ OK (เช่น 400, 409, 500), แปลง Response ข้อผิดพลาด
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to save grade.');
            }

            // ตั้งค่าข้อความสำเร็จขึ้นอยู่กับการเพิ่มหรืออัปเดต
            setSuccess(editingGrade ? 'Grade updated successfully!' : 'Grade added successfully!');
            setNewGradeName(''); // ล้างช่องป้อนข้อมูล
            setEditingGrade(null); // ล้างสถานะการแก้ไขหลังจากบันทึกสำเร็จ
            await fetchGrades(); // ดึงรายการระดับชั้นใหม่เพื่อแสดงข้อมูลล่าสุด
            if (onGradeUpdate) {
                onGradeUpdate(); // เรียก Callback ของคอมโพเนนต์แม่หากมีให้
            }
        } catch (err) {
            console.error('Error saving grade:', err);
            setError(err.message); // ตั้งค่าข้อความข้อผิดพลาดเพื่อแสดง
        } finally {
            setSubmitting(false); // สิ้นสุดสถานะกำลังส่ง
        }
    };

    // --- การดำเนินการแก้ไข ---
    // ฟังก์ชันสำหรับตั้งค่าฟอร์มเป็นโหมด "แก้ไข"
    const handleEdit = (grade) => {
        setEditingGrade(grade); // เก็บอ็อบเจกต์ระดับชั้นที่กำลังแก้ไข
        setNewGradeName(grade.name); // เติมช่องป้อนข้อมูลด้วยชื่อระดับชั้นปัจจุบัน
        setError(null); // ล้างข้อผิดพลาดที่มีอยู่
        setSuccess(null); // ล้างข้อความสำเร็จที่มีอยู่
    };

    // ฟังก์ชันสำหรับยกเลิกโหมด "แก้ไข"
    const handleCancelEdit = () => {
        setEditingGrade(null); // ล้างสถานะการแก้ไข
        setNewGradeName(''); // ล้างช่องป้อนข้อมูล
        setError(null);
        setSuccess(null);
    };

    // --- การดำเนินการลบ ---
    // ฟังก์ชันสำหรับจัดการการลบระดับชั้น
    const handleDelete = async (id, name) => {
        // กล่องโต้ตอบยืนยันก่อนลบ
        if (!confirm(`Are you sure you want to delete grade "${name}"? This action cannot be undone.`)) {
            return;
        }
        setSubmitting(true); // ใช้สถานะกำลังส่งสำหรับการลบด้วย
        setError(null); // ล้างข้อผิดพลาดก่อนหน้า
        setSuccess(null); // ล้างข้อความสำเร็จก่อนหน้า
        try {
            const response = await fetch(`/api/grades?id=${id}`, { method: 'DELETE' }); // ส่ง Request DELETE
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to delete grade.');
            }
            setSuccess('Grade deleted successfully!'); // ตั้งค่าข้อความสำเร็จ
            await fetchGrades(); // ดึงรายการใหม่
            if (onGradeUpdate) {
                onGradeUpdate(); // แจ้งเตือนคอมโพเนนต์แม่
            }
        } catch (err) {
            console.error('Error deleting grade:', err);
            setError(err.message); // ตั้งค่าข้อความข้อผิดพลาด
        } finally {
            setSubmitting(false); // สิ้นสุดสถานะกำลังส่ง
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mb-8"> {/* เพิ่ม dark:bg-gray-900 */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingGrade ? 'แก้ไขระดับชั้น' : 'เพิ่มระดับชั้นใหม่'}
            </h3>

            {/* แสดงข้อความข้อผิดพลาดและสำเร็จ */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            {/* ฟอร์มสำหรับเพิ่ม/แก้ไขระดับชั้น */}
            <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={newGradeName}
                    onChange={(e) => setNewGradeName(e.target.value)}
                    placeholder="ชื่อระดับชั้น (เช่น ม.1, ป.2)"
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" // เพิ่ม dark mode classes
                    disabled={submitting} // ปิดการใช้งาน input ขณะกำลังส่ง
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting} // ปิดการใช้งานปุ่มขณะกำลังส่ง
                >
                    {submitting ? 'กำลังบันทึก...' : (editingGrade ? 'บันทึกการแก้ไข' : 'เพิ่ม')}
                </button>
                {editingGrade && ( // แสดงปุ่มยกเลิกเฉพาะเมื่อกำลังแก้ไข
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        ยกเลิก
                    </button>
                )}
            </form>

            {/* รายการระดับชั้น */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">ระดับชั้นทั้งหมด</h3>
            {loading ? ( // แสดงตัวบ่งชี้การโหลดขณะดึงข้อมูลเริ่มต้น
                <p className="text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
            ) : grades.length === 0 ? ( // แสดงข้อความหากไม่พบระดับชั้น
                <p className="text-center text-gray-500 dark:text-gray-400">ยังไม่มีข้อมูลระดับชั้น</p>
            ) : (
                <ul className="space-y-3">
                    {grades.map((grade) => (
                        <li key={grade.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm"> {/* เพิ่ม dark mode classes */}
                            <span className="font-medium text-gray-900 dark:text-white">{grade.name}</span> {/* เพิ่ม dark mode class */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(grade)}
                                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition"
                                    disabled={submitting} // ปิดการใช้งานขณะกำลังดำเนินการใดๆ
                                >
                                    แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(grade.id, grade.name)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition disabled:opacity-50"
                                    disabled={submitting} // ปิดการใช้งานขณะกำลังดำเนินการใดๆ
                                >
                                    ลบ
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
