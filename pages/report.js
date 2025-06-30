import { useEffect, useState } from 'react';

export default function ReportPage() {
    const [bookings, setBookings] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [grades, setGrades] = useState([]);
    const [rooms, setRooms] = useState([]); // State for rooms/labs

    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');

    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to fetch all necessary data
    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookingsRes, teachersRes, gradesRes] = await Promise.all([
                fetch('/api/bookings'),
                fetch('/api/teachers'),
                fetch('/api/grades'),
            ]);

            const [bookingsData, teachersData, gradesData] = await Promise.all([
                bookingsRes.json(),
                teachersRes.json(),
                gradesRes.json(),
            ]);

            // --- NOTE: Mock room data for demonstration purposes ---
            // In a real app, you would fetch this from a 'rooms' API.
            const mockRooms = [{ name: 'Lab 1' }, { name: 'Lab 2' }, { name: 'Lab 3' }];
            setRooms(mockRooms);

            // Augment bookings with a 'room' property for filtering
            const bookingsWithRooms = bookingsData.map((booking) => ({
                ...booking,
                room: mockRooms[Math.floor(Math.random() * mockRooms.length)].name, // Assign a random mock room
            }));

            setBookings(bookingsWithRooms);
            setTeachers(teachersData);
            setGrades(gradesData);

        } catch (error) {
            console.error('Error fetching data for report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Effect to filter bookings whenever a filter is changed
    useEffect(() => {
        let filtered = bookings;

        if (selectedTeacher) {
            filtered = filtered.filter(booking => booking.teacher === selectedTeacher);
        }
        if (selectedGrade) {
            filtered = filtered.filter(booking => booking.grade === selectedGrade);
        }
        if (selectedRoom) {
            filtered = filtered.filter(booking => booking.room === selectedRoom);
        }

        // Sort by date and time
        filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateA.getTime() - dateB.getTime();
            }
            return a.timeSlot.localeCompare(b.timeSlot); // Sort by time string if dates are same
        });

        setFilteredBookings(filtered);
    }, [bookings, selectedTeacher, selectedGrade, selectedRoom]);

    // Function to clear all filters
    const handleClearFilters = () => {
        setSelectedTeacher('');
        setSelectedGrade('');
        setSelectedRoom('');
    };

    return (
        <div className="min-h-[calc(100vh-128px)] p-8 bg-gray-100 dark:bg-gray-800 dark:text-white transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
                    รายงานการใช้งานห้องปฏิบัติการ
                </h1>

                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">ตัวกรองรายงาน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div>
                            <label htmlFor="teacher-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                รายงานตามครู
                            </label>
                            <select
                                id="teacher-select"
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- แสดงทั้งหมด --</option>
                                {teachers.map((t) => (<option key={t.id} value={t.name}>{t.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="grade-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                รายงานตามระดับชั้น
                            </label>
                            <select
                                id="grade-select"
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- แสดงทั้งหมด --</option>
                                {grades.map((g) => (<option key={g.id} value={g.name}>{g.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="room-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                รายงานตามห้องปฏิบัติการ
                            </label>
                            <select
                                id="room-select"
                                value={selectedRoom}
                                onChange={(e) => setSelectedRoom(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">-- แสดงทั้งหมด --</option>
                                {rooms.map((r, index) => (<option key={index} value={r.name}>{r.name}</option>))}
                            </select>
                        </div>
                        <button
                            onClick={handleClearFilters}
                            className="w-full h-10 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                        >
                            ล้างตัวกรอง
                        </button>
                    </div>
                </div>

                {/* Report Table */}
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    วันที่
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    คาบเวลา
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ห้องปฏิบัติการ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ครูผู้สอน
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ระดับชั้น
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        กำลังโหลดข้อมูลรายงาน...
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        ไม่พบข้อมูลการใช้งานตามตัวกรองที่เลือก
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {booking.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {booking.timeSlot}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {booking.room}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {booking.teacher}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                            {booking.grade}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}