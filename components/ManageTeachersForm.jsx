// components/ManageTeachersForm.js
import { useState, useEffect } from 'react';

export default function ManageTeachersForm({ onTeacherUpdate }) {
    const [teachers, setTeachers] = useState([]);
    const [newTeacherName, setNewTeacherName] = useState('');
    const [editingTeacher, setEditingTeacher] = useState(null); // เก็บอ็อบเจกต์ครูที่กำลังแก้ไข
    const [loading, setLoading] = useState(true); // สถานะการโหลดเริ่มต้นสำหรับการดึงครู
    const [submitting, setSubmitting] = useState(false); // สถานะสำหรับการดำเนินการเพิ่ม/อัปเดต/ลบ
    const [error, setError] = useState(null); // สถานะสำหรับแสดงข้อความข้อผิดพลาด
    const [success, setSuccess] = useState(null); // สถานะสำหรับแสดงข้อความสำเร็จ

    // ฟังก์ชันสำหรับดึงครูทั้งหมดจาก API
    const fetchTeachers = async () => {
        setLoading(true);
        setError(null); // ล้างข้อผิดพลาดก่อนหน้า
        try {
            const response = await fetch('/api/teachers');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch teachers.');
            }
            const data = await response.json();
            setTeachers(data); // อัปเดตรายการครู
        } catch (err) {
            console.error('Error fetching teachers:', err);
            setError(err.message); // ตั้งค่าข้อความข้อผิดพลาด
        } finally {
            setLoading(false); // สิ้นสุดสถานะการโหลด
        }
    };

    // Effect hook เพื่อดึงครูเมื่อคอมโพเนนต์ถูกเมาท์
    useEffect(() => {
        fetchTeachers();
    }, []);

    // ฟังก์ชันสำหรับจัดการการส่งฟอร์ม (เพิ่มหรืออัปเดต)
    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันพฤติกรรมการส่งฟอร์มเริ่มต้น
        setSubmitting(true); // เริ่มสถานะกำลังส่ง
        setError(null); // ล้างข้อผิดพลาดก่อนหน้า
        setSuccess(null); // ล้างข้อความสำเร็จก่อนหน้า

        const trimmedName = newTeacherName.trim();
        // การตรวจสอบพื้นฐาน: ตรวจสอบว่าช่องป้อนข้อมูลว่างเปล่าหรือไม่หลังจากตัดช่องว่าง
        if (!trimmedName) {
            setError('Teacher name cannot be empty.');
            setSubmitting(false);
            return;
        }

        try {
            let response;
            let method;
            let url;
            let bodyData = { name: trimmedName }; // เฉพาะชื่อสำหรับทั้งการเพิ่มและการแก้ไข

            if (editingTeacher) {
                // หาก editingTeacher ถูกตั้งค่า, นี่คือการดำเนินการอัปเดต (PUT)
                method = 'PUT';
                url = `/api/teachers?id=${editingTeacher.id}`; // ส่ง ID ใน query สำหรับการอัปเดต
            } else {
                // มิฉะนั้น, นี่คือการดำเนินการเพิ่ม (POST)
                method = 'POST';
                url = '/api/teachers';
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
                throw new Error(errorData.message || errorData.error || 'Failed to save teacher.');
            }

            // ตั้งค่าข้อความสำเร็จขึ้นอยู่กับการเพิ่มหรืออัปเดต
            setSuccess(editingTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!');
            setNewTeacherName(''); // ล้างช่องป้อนข้อมูล
            setEditingTeacher(null); // ล้างสถานะการแก้ไขหลังจากบันทึกสำเร็จ
            await fetchTeachers(); // ดึงรายการครูใหม่เพื่อแสดงข้อมูลล่าสุด
            if (onTeacherUpdate) {
                onTeacherUpdate(); // เรียก Callback ของคอมโพเนนต์แม่หากมีให้ (เช่น เพื่อรีเฟรชข้อมูลในหน้าหลัก)
            }
        } catch (err) {
            console.error('Error saving teacher:', err);
            setError(err.message); // ตั้งค่าข้อความข้อผิดพลาดเพื่อแสดง
        } finally {
            setSubmitting(false); // สิ้นสุดสถานะกำลังส่ง
        }
    };

    // ฟังก์ชันสำหรับตั้งค่าฟอร์มเป็นโหมด "แก้ไข"
    const handleEdit = (teacher) => {
        setEditingTeacher(teacher); // เก็บอ็อบเจกต์ครูที่กำลังแก้ไข
        setNewTeacherName(teacher.name); // เติมช่องป้อนข้อมูลด้วยชื่อครูปัจจุบัน
        setError(null); // ล้างข้อผิดพลาดที่มีอยู่
        setSuccess(null); // ล้างข้อความสำเร็จที่มีอยู่
    };

    // ฟังก์ชันสำหรับยกเลิกโหมด "แก้ไข"
    const handleCancelEdit = () => {
        setEditingTeacher(null); // ล้างสถานะการแก้ไข
        setNewTeacherName(''); // ล้างช่องป้อนข้อมูล
        setError(null);
        setSuccess(null);
    };

    // ฟังก์ชันสำหรับจัดการการลบครู
    const handleDelete = async (id, name) => {
        // กล่องโต้ตอบยืนยันก่อนลบ
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบครู "${name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
            return;
        }
        setSubmitting(true); // ใช้สถานะกำลังส่งสำหรับการลบด้วย
        setError(null); // ล้างข้อผิดพลาดก่อนหน้า
        setSuccess(null); // ล้างข้อความสำเร็จก่อนหน้า
        try {
            const response = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' }); // ส่ง Request DELETE
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to delete teacher.');
            }
            setSuccess('Teacher deleted successfully!'); // ตั้งค่าข้อความสำเร็จ
            await fetchTeachers(); // ดึงรายการใหม่
            if (onTeacherUpdate) {
                onTeacherUpdate(); // แจ้งเตือนคอมโพเนนต์แม่
            }
        } catch (err) {
            console.error('Error deleting teacher:', err);
            setError(err.message); // ตั้งค่าข้อความข้อผิดพลาด
        } finally {
            setSubmitting(false); // สิ้นสุดสถานะกำลังส่ง
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mb-8"> {/* เพิ่ม dark:bg-gray-900 สำหรับคอนเทนเนอร์หลัก */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingTeacher ? 'แก้ไขรายชื่อครู' : 'เพิ่มรายชื่อครูใหม่'}
            </h3>

            {/* แสดงข้อความข้อผิดพลาดและสำเร็จ */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            {/* ฟอร์มสำหรับเพิ่ม/แก้ไขครู */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6"> {/* Changed to flex-col and responsive flex-row */}
                <input
                    type="text"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    placeholder="ชื่อครูใหม่"
                    // ปรับปรุง Dark Mode:
                    // ในโหมดสว่าง: bg-white (พื้นหลัง), text-gray-900 (ข้อความ), border-gray-300 (ขอบ)
                    // ในโหมดมืด: dark:bg-gray-700 (พื้นหลังเข้มขึ้น), dark:text-white (ข้อความขาว), dark:border-gray-600 (ขอบเข้มขึ้น)
                    className="w-full sm:flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                />
                <div className="flex gap-2 w-full sm:w-auto"> {/* Wrap buttons in a div for better control */}
                    <button
                        type="submit"
                        className="flex-grow sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? 'กำลังบันทึก...' : (editingTeacher ? 'บันทึกการแก้ไข' : 'เพิ่ม')}
                    </button>
                    {editingTeacher && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-grow sm:flex-none px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting}
                        >
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>

            {/* รายการครู */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">รายชื่อครูทั้งหมด</h3>
            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
            ) : teachers.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">ยังไม่มีรายชื่อครู</p>
            ) : (
                <ul className="space-y-3">
                    {teachers.map((teacher) => (
                        <li
                            key={teacher.id}
                            // ปรับปรุง Dark Mode:
                            // ในโหมดสว่าง: bg-gray-50 (พื้นหลัง), text-gray-900 (ชื่อครู)
                            // ในโหมดมืด: dark:bg-gray-800 (พื้นหลัง), dark:text-white (ชื่อครู)
                            className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm"
                        >
                            <span className="font-medium text-gray-900 dark:text-white">{teacher.name}</span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(teacher)}
                                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition"
                                    disabled={submitting}
                                >
                                    แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(teacher.id, teacher.name)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition disabled:opacity-50"
                                    disabled={submitting}
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
