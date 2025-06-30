import { useState, useEffect } from 'react';

// This component now accepts a 'rooms' prop
export default function BookingForm({ onBookingSuccess, teachers, grades, timeSlots, rooms }) {
    const [teacher, setTeacher] = useState('');
    const [grade, setGrade] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [room, setRoom] = useState(''); // NEW: state for room
    const [loading, setLoading] = useState(false);

    // You can set a default room if needed, or leave it empty.
    // useEffect(() => {
    //   if (rooms.length > 0) {
    //     setRoom(rooms[0].id);
    //   }
    // }, [rooms]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // NEW: Add roomId and status to the booking object
        const newBooking = { teacher, grade, date, timeSlot, roomId: room, status: 'pending' };

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking),
            });
            if (!response.ok) throw new Error('Failed to create booking');
            await response.json();
            alert('การจองของคุณถูกส่งเรียบร้อยแล้ว รอการอนุมัติจากผู้ดูแลระบบ');
            if (onBookingSuccess) onBookingSuccess();
            setTeacher(''); setGrade(''); setDate(''); setTimeSlot(''); setRoom('');
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('เกิดข้อผิดพลาดในการจอง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-lg mx-auto space-y-4 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">ฟอร์มจองห้อง (รายวัน)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อครูผู้สอน</label>
                    <select id="teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
                        <option value="" disabled>-- เลือกครู --</option>
                        {teachers.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ระดับชั้น</label>
                    <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
                        <option value="" disabled>-- เลือกระดับชั้น --</option>
                        {grades.map((g) => (<option key={g.id} value={g.name}>{g.name}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ห้องปฏิบัติการ</label>
                    <select id="room" value={room} onChange={(e) => setRoom(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
                        <option value="" disabled>-- เลือกห้อง --</option>
                        {rooms.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">วันที่</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 dark:text-gray-300">คาบเวลา</label>
                    <select id="timeSlot" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
                        <option value="" disabled>-- เลือกคาบเวลา --</option>
                        {timeSlots.map((slot) => (<option key={slot.id} value={slot.time}>{slot.name} ({slot.time})</option>))}
                    </select>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{loading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอจองห้อง'}</button>
            </form>
        </div>
    );
}