import { useEffect, useState } from 'react';

// NEW: Accept teachers and grades as props
export default function EditBookingForm({ booking, teachers, grades, onUpdateSuccess, onClose }) {
    const [formData, setFormData] = useState(booking);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(booking);
    }, [booking]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update booking');
            }

            await response.json();
            alert('อัปเดตข้อมูลสำเร็จ!');

            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
            onClose();

        } catch (error) {
            console.error('Error updating booking:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดต');
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลการจอง</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">ชื่อครูผู้สอน</label>
                    <select
                        name="teacher"
                        value={formData.teacher}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
                    >
                        {teachers.map((t) => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">ระดับชั้น</label>
                    <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
                    >
                        {grades.map((g) => (
                            <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">วันที่</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">คาบเวลา</label>
                    <input
                        type="text"
                        name="timeSlot"
                        placeholder="เช่น: คาบ 1 (08:30 - 09:20)"
                        value={formData.timeSlot}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
            </form>
        </div>
    );
}