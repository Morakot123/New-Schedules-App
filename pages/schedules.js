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
    const getBookingInfo = (date, time, roomId) => {
        const formattedDate = formatDate(date);
        // Ensure bookings is an array before calling find
        if (!Array.isArray(bookings)) return null;

        return bookings.find(
            (booking) => booking.date === formattedDate && booking.timeSlot === time && booking.roomId === roomId && booking.status === 'approved'
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
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
                    ตารางการใช้งานห้องปฏิบัติการ
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

                {loading ? (
                    <p className="text-center text-xl text-gray-500">กำลังโหลดตาราง...</p>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left side: Schedule Table */}
                        <div className="flex-1 overflow-x-auto rounded-lg shadow-md bg-white dark:bg-gray-900">
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
                                                const booking = getBookingInfo(date, slot.time, selectedRoomId);
                                                return (
                                                    <td
                                                        key={index}
                                                        className={`px-4 py-4 border-l border-gray-200 dark:border-gray-700 text-sm text-center ${booking ? 'bg-red-100 dark:bg-red-900 text-red-800' : 'bg-green-100 dark:bg-green-900 text-green-800'
                                                            } font-semibold`}
                                                    >
                                                        {booking ? (
                                                            <>
                                                                <div className="font-bold">{booking.teacher}</div>
                                                                <div className="text-xs text-red-600 dark:text-red-300">({booking.grade})</div>
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

                        {/* Right side: Booking Form (Conditional) */}
                        <div className="w-full lg:w-96 flex-shrink-0">
                            {sessionStatus === 'authenticated' ? (
                                <BookingForm
                                    onBookingSuccess={fetchData}
                                    teachers={teachers}
                                    grades={grades}
                                    timeSlots={timeSlots}
                                    rooms={rooms}
                                    selectedRoomId={selectedRoomId} // Pass selected room ID to the form
                                />
                            ) : (
                                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md text-center">
                                    <p className="text-lg font-bold mb-4">กรุณาเข้าสู่ระบบเพื่อจองห้อง</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        หากยังไม่มีบัญชี <a href="/register" className="text-blue-600 hover:underline">คลิกที่นี่เพื่อสมัครสมาชิก</a>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
