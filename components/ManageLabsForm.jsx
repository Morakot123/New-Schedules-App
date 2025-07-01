// components/ManageLabsForm.js
import { useState, useEffect } from 'react';

export default function ManageLabsForm({ onLabUpdate }) {
    const [labs, setLabs] = useState([]);
    const [newLab, setNewLab] = useState({
        name: '',
        roomNumber: '',
        capacity: '',
    });
    const [editingLab, setEditingLab] = useState(null); // เก็บอ็อบเจกต์ห้องปฏิบัติการที่กำลังแก้ไข
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // ฟังก์ชันสำหรับดึงห้องปฏิบัติการทั้งหมดจาก API
    const fetchLabs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/rooms'); // ใช้ endpoint /api/rooms
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch labs.');
            }
            const data = await response.json();
            setLabs(data);
        } catch (err) {
            console.error('Error fetching labs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLabs();
    }, []);

    // ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงในฟอร์ม
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewLab(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ฟังก์ชันสำหรับจัดการการส่งฟอร์ม (เพิ่มหรืออัปเดต)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // การตรวจสอบพื้นฐาน
        if (!newLab.name.trim()) {
            setError('Lab name cannot be empty.');
            setSubmitting(false);
            return;
        }
        if (newLab.capacity && isNaN(parseInt(newLab.capacity))) {
            setError('Capacity must be a number.');
            setSubmitting(false);
            return;
        }

        try {
            let response;
            let method;
            let url;

            // เตรียมข้อมูลที่จะส่ง
            const dataToSend = {
                name: newLab.name.trim(),
                roomNumber: newLab.roomNumber.trim() || null, // ถ้าว่างให้ส่งเป็น null
                capacity: newLab.capacity ? parseInt(newLab.capacity) : null, // ถ้าว่างให้ส่งเป็น null
            };

            if (editingLab) {
                method = 'PUT';
                url = `/api/rooms?id=${editingLab.id}`;
            } else {
                method = 'POST';
                url = '/api/rooms';
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to save lab.');
            }

            setSuccess(editingLab ? 'อัปเดตห้องปฏิบัติการสำเร็จ!' : 'เพิ่มห้องปฏิบัติการสำเร็จ!');
            setNewLab({ name: '', roomNumber: '', capacity: '' }); // ล้าง input
            setEditingLab(null); // ล้างสถานะการแก้ไข
            await fetchLabs(); // รีเฟรชรายการ
            if (onLabUpdate) {
                onLabUpdate(); // แจ้งเตือนคอมโพเนนต์แม่หากมี Callback ให้
            }
        } catch (err) {
            console.error('Error saving lab:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ฟังก์ชันสำหรับเริ่มแก้ไขห้องปฏิบัติการ
    const handleEdit = (lab) => {
        setEditingLab(lab);
        setNewLab({
            name: lab.name,
            roomNumber: lab.roomNumber || '', // แสดงค่าว่างถ้าเป็น null
            capacity: lab.capacity || '', // แสดงค่าว่างถ้าเป็น null
        });
        setError(null);
        setSuccess(null);
    };

    // ฟังก์ชันสำหรับยกเลิกการแก้ไข
    const handleCancelEdit = () => {
        setEditingLab(null);
        setNewLab({ name: '', roomNumber: '', capacity: '' });
        setError(null);
        setSuccess(null);
    };

    // ฟังก์ชันสำหรับจัดการการลบห้องปฏิบัติการ
    const handleDelete = async (id, name) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบห้องปฏิบัติการ "${name}"? การดำเนินการนี้ไม่สามารถย้อนกลับได้`)) {
            return;
        }
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to delete lab.');
            }
            setSuccess('ลบห้องปฏิบัติการสำเร็จ!');
            await fetchLabs(); // รีเฟรชรายการ
            if (onLabUpdate) {
                onLabUpdate(); // แจ้งเตือนคอมโพเนนต์แม่
            }
        } catch (err) {
            console.error('Error deleting lab:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingLab ? 'แก้ไขข้อมูลห้องปฏิบัติการ' : 'เพิ่มห้องปฏิบัติการใหม่'}
            </h3>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อห้องปฏิบัติการ</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={newLab.name}
                        onChange={handleChange}
                        placeholder="เช่น ห้องปฏิบัติการชีวะ"
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                    />
                </div>
                <div>
                    <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">หมายเลขห้อง (ไม่บังคับ)</label>
                    <input
                        type="text"
                        id="roomNumber"
                        name="roomNumber"
                        value={newLab.roomNumber}
                        onChange={handleChange}
                        placeholder="เช่น 301, Lab A"
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ความจุคน (ไม่บังคับ)</label>
                    <input
                        type="number"
                        id="capacity"
                        name="capacity"
                        value={newLab.capacity}
                        onChange={handleChange}
                        placeholder="เช่น 30"
                        className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                    />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? 'กำลังบันทึก...' : (editingLab ? 'บันทึกการแก้ไข' : 'เพิ่มห้องปฏิบัติการ')}
                    </button>
                    {editingLab && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting}
                        >
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>

            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">ห้องปฏิบัติการทั้งหมด</h3>
            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
            ) : labs.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">ยังไม่มีข้อมูลห้องปฏิบัติการ</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อห้อง</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หมายเลขห้อง</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ความจุ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {labs.map((lab) => (
                                <tr key={lab.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lab.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lab.roomNumber || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lab.capacity || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(lab)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                                            disabled={submitting}
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            onClick={() => handleDelete(lab.id, lab.name)}
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
    );
}
