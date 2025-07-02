import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession
import BookingForm from '../components/BookingForm';

export default function LabSchedulePage() {
    const { data: session, status: sessionStatus } = useSession(); // Get session status
    const [bookings, setBookings] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // NEW: State to store general errors from API fetches

    // Define the days to display (Today + next 6 days)
    const today = new Date();
    const daysToShow = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
    });

    // Map getDay() numbers to Thai day names
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

    const fetchData = async () => {
        setLoading(true);
        setError(null); // Clear any previous errors

        try {
            // Use Promise.allSettled to allow individual fetches to fail without stopping others
            const [bookingsRes, teachersRes, gradesRes, timeSlotsRes, roomsRes] = await Promise.allSettled([
                fetch('/api/bookings'),
                fetch('/api/teachers'),
                fetch('/api/grades'),
                fetch('/api/time-slots'),
                fetch('/api/rooms'),
            ]);

            // Helper function to process response and check for Array
            const processResponse = async (responsePromise, fallbackValue = []) => {
                if (responsePromise.status === 'fulfilled') {
                    const response = responsePromise.value;
                    if (response.ok) {
                        const data = await response.json();
                        // IMPORTANT: Validate if the data is an array
                        if (Array.isArray(data)) {
                            return data;
                        } else {
                            console.error(`API returned non-array data from ${response.url}:`, data);
                            throw new Error(`Invalid data format from ${response.url}`);
                        }
                    } else {
                        const errorData = await response.json();
                        throw new Error(`API failed (${response.url}): ${response.status} - ${errorData.message || errorData.error || 'Unknown error'}`);
                    }
                } else {
                    // This handles network errors or errors thrown during fetch itself
                    throw new Error(`Network or unexpected error fetching ${responsePromise.reason.message}`);
                }
            };

            const [
                bookingsData,
                teachersData,
                gradesData,
                timeSlotsData,
                roomsData
            ] = await Promise.all([
                processResponse(bookingsRes, []),
                processResponse(teachersRes, []),
                processResponse(gradesRes, []),
                processResponse(timeSlotsRes, []),
                processResponse(roomsRes, []),
            ]);

            setBookings(bookingsData);
            setTeachers(teachersData);
            setGrades(gradesData);
            // Ensure timeSlotsData is sorted after fetching
            setTimeSlots(timeSlotsData.sort((a, b) => a.time.localeCompare(b.time)));
            setRooms(roomsData);

            if (roomsData.length > 0 && !selectedRoomId) {
                setSelectedRoomId(roomsData[0].id); // Set default selected room
            }
        } catch (err) {
            console.error('Error fetching data for Lab Schedule:', err);
            setError(err.message || 'An error occurred while loading schedule data.'); // Set the error message
            // Ensure all states are reset to empty arrays on error to prevent .map() issues
            setBookings([]);
            setTeachers([]);
            setGrades([]);
            setTimeSlots([]);
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch data if session status is not loading, to avoid unnecessary fetches
        // and ensure context like session is available if needed by APIs.
        if (sessionStatus !== 'loading') {
            fetchData();
        }
    }, [sessionStatus]); // Depend on sessionStatus

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Function to get booking info for a specific date, time slot, and room
    const getBookingInfo = (date, timeSlotTime, roomId) => { // เปลี่ยนชื่อ parameter เป็น timeSlotTime
        const formattedDate = formatDate(date);
        // Ensure bookings is an array before calling find
        if (!Array.isArray(bookings)) return null;

        return bookings.find(
            // แก้ไขการเปรียบเทียบ: เข้าถึง booking.timeSlot.time แทน booking.timeSlot โดยตรง
            (booking) => booking.date === formattedDate && booking.timeSlot?.time === timeSlotTime && booking.room?.id === roomId && booking.status === 'approved'
        );
    };

    // Find the selected room's name for display
    const selectedRoomName = rooms.find(room => room.id === selectedRoomId)?.name || 'กำลังโหลด...';

    // Show loading state for initial session check
    if (sessionStatus === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] p-8 bg-gray-100 dark:bg-gray-800 dark:text-white transition-colors duration-300">
            {/* Removed max-w-7xl to allow content to span wider */}
            <div className="mx-auto w-full"> {/* Use w-full to ensure it takes available width, mx-auto for centering if needed by parent */}
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 text-center flex items-center justify-center gap-3"> {/* เปลี่ยน text-3xl เป็น text-xl */}
                    {/* SVG Logo for Smart Lab */}
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500">
                        <path d="M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M7 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="9" r="1" fill="currentColor" />
                        <circle cx="15" cy="9" r="1" fill="currentColor" />
                    </svg>
                    <span>
                        ระบบบริหารจัดการและจองห้องปฏิบัติการอัจฉริยะ
                        <br className="sm:hidden" /> {/* Line break for small screens */}
                        (Smart Lab Management and Booking System - SLMBS)
                    </span>
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {/* Room selection dropdown */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                    <label htmlFor="room-select" className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        เลือกห้องปฏิบัติการ:
                    </label>
                    <select
                        id="room-select"
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        {loading ? <option>กำลังโหลด...</option> : rooms.map((room) => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                </div>

                {/* Conditional Login Message */}
                {sessionStatus !== 'authenticated' && (
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md text-center mb-8">
                        <p className="text-lg font-bold mb-4">กรุณาเข้าสู่ระบบเพื่อจองห้อง</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            หากยังไม่มีบัญชี <a href="/register" className="text-blue-600 hover:underline">คลิกที่นี่เพื่อสมัครสมาชิก</a>
                        </p>
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-xl text-gray-500">กำลังโหลดตาราง...</p>
                ) : (
                    <div className="flex flex-col gap-8"> {/* Changed to flex-col for all screen sizes */}
                        {/* Booking Form (Conditional) - Moved to top */}
                        {sessionStatus === 'authenticated' && (
                            <div className="w-full flex-shrink-0"> {/* Ensure it takes full width */}
                                <BookingForm
                                    onBookingSuccess={fetchData}
                                    teachers={teachers}
                                    grades={grades}
                                    timeSlots={timeSlots}
                                    rooms={rooms}
                                    selectedRoomId={selectedRoomId} // Pass selected room ID to the form
                                />
                            </div>
                        )}

                        {/* Schedule Table - Now below the form */}
                        <div className="flex-1 rounded-lg shadow-md bg-white dark:bg-gray-900 overflow-x-auto"> {/* Added overflow-x-auto here for the table */}
                            <h3 className="text-2xl font-bold p-4 bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0">
                                {selectedRoomName}
                            </h3>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-14"> {/* Adjusted top for header */}
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] lg:min-w-[180px]">
                                            คาบ/วัน
                                        </th>
                                        {daysToShow.map((date, index) => (
                                            <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200 dark:border-gray-700 min-w-[150px]">
                                                {dayNames[date.getDay()]} <br />
                                                <span className="font-bold text-gray-900 dark:text-white">{formatDate(date)}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {timeSlots.map((slot) => (
                                        <tr key={slot.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 sticky left-0">
                                                {slot.time} {/* Use slot.time as the primary display for time slots */}
                                            </td>
                                            {daysToShow.map((date, index) => {
                                                const booking = getBookingInfo(date, slot.time, selectedRoomId); // ส่ง slot.time แทน slot
                                                return (
                                                    <td
                                                        key={index}
                                                        className={`px-4 py-4 border-l border-gray-200 dark:border-gray-700 text-sm text-center ${booking ? 'bg-red-100 dark:bg-red-900 text-red-800' : 'bg-green-100 dark:bg-green-900 text-green-800'
                                                            } font-semibold`}
                                                    >
                                                        {booking ? (
                                                            <>
                                                                <div className="font-bold">{booking.teacher?.name}</div> {/* ใช้ booking.teacher?.name */}
                                                                <div className="text-xs text-red-600 dark:text-red-300">({booking.grade?.name})</div> {/* ใช้ booking.grade?.name */}
                                                            </>
                                                        ) : (
                                                            'ว่าง'
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
