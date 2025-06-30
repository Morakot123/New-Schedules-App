// components/ManageTimeSlotsForm.js
import { useState, useEffect } from 'react';

export default function ManageTimeSlotsForm({ onTimeSlotUpdate }) {
    const [timeSlots, setTimeSlots] = useState([]);
    const [newTimeSlot, setNewTimeSlot] = useState('');
    const [editingTimeSlot, setEditingTimeSlot] = useState(null); // เก็บอ็อบเจกต์ช่วงเวลาที่กำลังแก้ไข
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // ฟังก์ชันสำหรับดึงช่วงเวลาจาก API
    const fetchTimeSlots = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/time-slots');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch time slots.');
            }
            const data = await response.json();
            setTimeSlots(data);
        } catch (err) {
            console.error('Error fetching time slots:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    // ฟังก์ชันสำหรับจัดการการส่งฟอร์ม (เพิ่มหรืออัปเดต)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // การตรวจสอบพื้นฐาน
        if (!newTimeSlot.trim()) {
            setError('Time slot cannot be empty.');
            setSubmitting(false);
            return;
        }

        try {
            let response;
            let method;
            let url;

            if (editingTimeSlot) {
                // อัปเดตช่วงเวลาที่มีอยู่
                method = 'PUT';
                url = `/api/time-slots?id=${editingTimeSlot.id}`;
            } else {
                // เพิ่มช่วงเวลาใหม่
                method = 'POST';
                url = '/api/time-slots';
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ time: newTimeSlot.trim() }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to save time slot.');
            }

            setSuccess(editingTimeSlot ? 'Time slot updated successfully!' : 'Time slot added successfully!');
            setNewTimeSlot(''); // ล้าง input
            setEditingTimeSlot(null); // ล้างสถานะการแก้ไข
            await fetchTimeSlots(); // รีเฟรชรายการ
            if (onTimeSlotUpdate) {
                onTimeSlotUpdate(); // แจ้งเตือนคอมโพเนนต์แม่หากมี Callback ให้
            }
        } catch (err) {
            console.error('Error saving time slot:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ฟังก์ชันสำหรับเริ่มแก้ไขช่วงเวลา
    const handleEdit = (timeSlot) => {
        setEditingTimeSlot(timeSlot);
        setNewTimeSlot(timeSlot.time);
        setError(null);
        setSuccess(null);
    };

    // ฟังก์ชันสำหรับยกเลิกการแก้ไข
    const handleCancelEdit = () => {
        setEditingTimeSlot(null);
        setNewTimeSlot('');
        setError(null);
        setSuccess(null);
    };

    // ฟังก์ชันสำหรับจัดการการลบช่วงเวลา
    const handleDelete = async (id, time) => {
        if (!confirm(`Are you sure you want to delete time slot "${time}"? This action cannot be undone.`)) {
            return;
        }
        setSubmitting(true); // ใช้สถานะกำลังส่งสำหรับการลบด้วย
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`/api/time-slots?id=${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to delete time slot.');
            }
            setSuccess('Time slot deleted successfully!');
            await fetchTimeSlots(); // รีเฟรชรายการ
            if (onTimeSlotUpdate) {
                onTimeSlotUpdate(); // แจ้งเตือนคอมโพเนนต์แม่
            }
        } catch (err) {
            console.error('Error deleting time slot:', err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md mb-8"> {/* เพิ่ม dark:bg-gray-900 */}
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingTimeSlot ? 'แก้ไขช่วงเวลา' : 'เพิ่มช่วงเวลาใหม่'}
            </h3>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    placeholder="ช่วงเวลา (เช่น 09:00-10:00)"
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" // เพิ่ม dark mode classes
                    disabled={submitting}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                >
                    {submitting ? 'กำลังบันทึก...' : (editingTimeSlot ? 'บันทึกการแก้ไข' : 'เพิ่ม')}
                </button>
                {editingTimeSlot && (
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

            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">ช่วงเวลาทั้งหมด</h3>
            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">กำลังโหลด...</p>
            ) : timeSlots.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">ยังไม่มีข้อมูลช่วงเวลา</p>
            ) : (
                <ul className="space-y-3">
                    {timeSlots.map((slot) => (
                        <li key={slot.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-md shadow-sm"> {/* เพิ่ม dark mode classes */}
                            <span className="font-medium text-gray-900 dark:text-white">{slot.time}</span> {/* เพิ่ม dark mode class */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(slot)}
                                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition"
                                    disabled={submitting}
                                >
                                    แก้ไข
                                </button>
                                <button
                                    onClick={() => handleDelete(slot.id, slot.time)}
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
