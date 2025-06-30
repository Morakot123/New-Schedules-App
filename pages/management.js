import { useEffect, useState } from 'react';
import Link from 'next/link'; // NEW: Import Link for navigation
import ManageTeachersForm from '../components/ManageTeachersForm';
import ManageGradesForm from '../components/ManageGradesForm';
import ManageTimeSlotsForm from '../components/ManageTimeSlotsForm';

// Component: Advanced Booking Form for recurring bookings
function AdvancedBookingForm({ onBookingSuccess, teachers, grades, timeSlots }) {
    const [teacher, setTeacher] = useState('');
    const [grade, setGrade] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [timeSlot, setTimeSlot] = useState('');
    const [loading, setLoading] = useState(false);

    // Map getDay() numbers to Thai day names for display
    const daysOfWeek = [
        { id: '1', name: 'จันทร์' },
        { id: '2', name: 'อังคาร' },
        { id: '3', name: 'พุธ' },
        { id: '4', name: 'พฤหัสบดี' },
        { id: '5', name: 'ศุกร์' },
        { id: '6', name: 'เสาร์' },
        { id: '0', name: 'อาทิตย์' },
    ];

    const handleDayChange = (e) => {
        const { value, checked } = e.target;
        setSelectedDays(
            checked ? [...selectedDays, value] : selectedDays.filter((day) => day !== value)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const selectedTimeSlot = timeSlots.find(slot => slot.id === timeSlot);
        if (!selectedTimeSlot) {
            alert('กรุณาเลือกคาบเวลา');
            setLoading(false);
            return;
        }

        const newBooking = {
            teacher,
            grade,
            startDate,
            endDate,
            selectedDays,
            timeSlot: selectedTimeSlot.time
        };

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking),
            });
            if (!response.ok) throw new Error('Failed to create booking');
            const result = await response.json();
            alert(`จองห้องสำเร็จ! สร้างรายการจองทั้งหมด ${result.newBookings.length} รายการ`);
            if (onBookingSuccess) onBookingSuccess();
            setTeacher(''); setGrade(''); setStartDate(''); setEndDate(''); setSelectedDays([]); setTimeSlot('');
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('เกิดข้อผิดพลาดในการจอง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ฟอร์มจองห้องปฏิบัติการ (แบบรายเทอม/ปี)</h2>
            <div>
                <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">ชื่อครูผู้สอน</label>
                <select id="teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                    <option value="" disabled>-- เลือกครู --</option>
                    {teachers.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}
                </select>
            </div>
            <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-700">ระดับชั้น</label>
                <select id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                    <option value="" disabled>-- เลือกระดับชั้น --</option>
                    {grades.map((g) => (<option key={g.id} value={g.name}>{g.name}</option>))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เลือกวันในสัปดาห์</label>
                <div className="flex flex-wrap gap-3">
                    {daysOfWeek.map((day) => (
                        <div key={day.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`day-${day.id}`}
                                value={day.id}
                                checked={selectedDays.includes(day.id)}
                                onChange={handleDayChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor={`day-${day.id}`} className="ml-2 text-sm text-gray-700">{day.name}</label>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">คาบเวลา</label>
                <select id="timeSlot" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md">
                    <option value="" disabled>-- เลือกคาบเวลา --</option>
                    {timeSlots.map((slot) => (<option key={slot.id} value={slot.id}>{slot.name} ({slot.time})</option>))}
                </select>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{loading ? 'กำลังบันทึก...' : 'จองห้องปฏิบัติการ'}</button>
        </form>
    );
}

// Main Management Page Component
export default function ManagementPage() {
    const [teachers, setTeachers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);

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
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
                    หน้าจัดการข้อมูลและจองแบบรายเทอม
                </h1>

                {/* Link back to Main Page */}
                <div className="flex justify-center mb-10">
                    <Link href="/">
                        <div className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition cursor-pointer">
                            กลับหน้าจองห้องรายวัน
                        </div>
                    </Link>
                </div>

                {/* Management Forms Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <ManageTeachersForm onTeacherUpdate={fetchData} />
                    <ManageGradesForm onGradeUpdate={fetchData} />
                    <ManageTimeSlotsForm onTimeSlotUpdate={fetchData} />
                </div>

                {/* Advanced Booking Form Section */}
                <div className="max-w-lg mx-auto">
                    <AdvancedBookingForm
                        onBookingSuccess={() => console.log('Advanced booking done')}
                        teachers={teachers}
                        grades={grades}
                        timeSlots={timeSlots}
                    />
                </div>
            </div>
        </div>
    );
}