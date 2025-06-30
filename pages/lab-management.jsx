import { useEffect, useState } from 'react';
import EditBookingForm from '../components/EditBookingForm';

// --- Component: BookingForm ---
// โค้ดสำหรับฟอร์มจอง (เหมือนเดิม)
const mockTeachers = [
    { id: 'T001', name: 'ครูสมศรี' },
    { id: 'T002', name: 'ครูสมชาย' },
    { id: 'T003', name: 'ครูมานี' },
];

const mockGrades = [
    { id: 'G10', name: 'ม.4' },
    { id: 'G11', name: 'ม.5' },
    { id: 'G12', name: 'ม.6' },
];

function BookingForm({ onBookingSuccess }) {
    const [teacher, setTeacher] = useState('');
    const [grade, setGrade] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const newBooking = { teacher, grade, date, timeSlot };
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking),
            });
            if (!response.ok) throw new Error('Failed to create booking');
            await response.json();
            alert('จองห้องสำเร็จ!');
            if (onBookingSuccess) onBookingSuccess();
            setTeacher(''); setGrade(''); setDate(''); setTimeSlot('');
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('เกิดข้อผิดพลาดในการจอง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ฟอร์มจองห้องปฏิบัติการ</h2>
            <div>
                <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">ชื่อครูผู้สอน</label>
                <select id="teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"><option value="" disabled>-- เลือกครู --</option>{mockTeachers.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}</select>
            </div>
            <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">ระดับชั้น</label>
                <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"><option value="" disabled>-- เลือกระดับชั้น --</option>{mockGrades.map((g) => (<option key={g.id} value={g.name}>{g.name}</option>))}</select>
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">วันที่</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">คาบเวลา</label>
                <input type="text" id="timeSlot" placeholder="เช่น: คาบ 1 (08:30 - 09:20)" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{loading ? 'กำลังบันทึก...' : 'จองห้องปฏิบัติการ'}</button>
        </form>
    );
}

// --- Main Page Component ---
export default function LabManagementPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/bookings');
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleEditClick = (booking) => {
        setEditingBooking(booking);
    };

    const handleCloseEdit = () => {
        setEditingBooking(null);
    };

    // --- NEW: Handler for the Delete button ---
    const handleDeleteClick = async (id) => {
        if (window.confirm('คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?')) {
            try {
                const response = await fetch(`/api/bookings?id=${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete booking');
                alert('ยกเลิกการจองสำเร็จ!');
                fetchBookings(); // Refresh the list after deletion
            } catch (error) {
                console.error('Error deleting booking:', error);
                alert('เกิดข้อผิดพลาดในการยกเลิก');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                    ระบบจัดการการใช้ห้องปฏิบัติการ
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Booking Form Section */}
                    <div>
                        <BookingForm onBookingSuccess={fetchBookings} />
                    </div>

                    {/* Booking List Section */}
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">รายการจองทั้งหมด</h2>
                        {loading ? (
                            <p className="text-center text-gray-500">กำลังโหลด...</p>
                        ) : bookings.length === 0 ? (
                            <p className="text-center text-gray-500">ยังไม่มีการจอง</p>
                        ) : (
                            <ul className="space-y-4">
                                {bookings.map((booking) => (
                                    <li key={booking.id} className="p-4 bg-gray-50 rounded-md shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {booking.teacher} ({booking.grade})
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                วันที่: {booking.date} | คาบ: {booking.timeSlot}
                                            </p>
                                        </div>
                                        {/* NEW: Edit and Delete buttons */}
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditClick(booking)}
                                                className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600"
                                            >
                                                แก้ไข
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(booking.id)}
                                                className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit form */}
            {editingBooking && (
                <EditBookingForm
                    booking={editingBooking}
                    onUpdateSuccess={fetchBookings}
                    onClose={handleCloseEdit}
                />
            )}
        </div>
    );
}