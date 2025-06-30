import { useEffect, useState, useMemo } from 'react';

export default function ReportsPage() {
    const [allBookings, setAllBookings] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]); // NEW: State for all teachers
    const [loading, setLoading] = useState(true);
    const [teacherFilter, setTeacherFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // NEW: Fetch teachers from API
    const fetchTeachers = async () => {
        try {
            const response = await fetch('/api/teachers');
            if (!response.ok) throw new Error('Failed to fetch teachers');
            const data = await response.json();
            setAllTeachers([{ id: '', name: 'ทั้งหมด' }, ...data]); // Add 'All' option
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/bookings');
            if (!response.ok) throw new Error('Failed to fetch bookings');
            const data = await response.json();
            setAllBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchTeachers(); // Fetch teachers when component mounts
    }, []);

    const filteredBookings = useMemo(() => {
        return allBookings.filter(booking => {
            if (teacherFilter && booking.teacher !== teacherFilter) {
                return false;
            }
            if (startDate && new Date(booking.date) < new Date(startDate)) {
                return false;
            }
            if (endDate && new Date(booking.date) > new Date(endDate)) {
                return false;
            }
            return true;
        });
    }, [allBookings, teacherFilter, startDate, endDate]);

    const handleDownload = () => {
        if (filteredBookings.length === 0) {
            alert('ไม่มีข้อมูลสำหรับดาวน์โหลด');
            return;
        }

        const headers = ['ID', 'ชื่อครู', 'ระดับชั้น', 'วันที่', 'คาบเวลา', 'วันที่จอง'];

        const rows = filteredBookings.map(booking => [
            booking.id,
            booking.teacher,
            booking.grade,
            booking.date,
            `"${booking.timeSlot}"`,
            new Date(booking.createdAt).toLocaleString(),
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'รายงานการใช้ห้องปฏิบัติการ.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
                    รายงานการใช้ห้องปฏิบัติการ
                </h1>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="teacherFilter" className="block text-sm font-medium text-gray-700">กรองตามครู</label>
                        <select
                            id="teacherFilter"
                            value={teacherFilter}
                            onChange={(e) => setTeacherFilter(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm"
                        >
                            {/* Update: Use teachers from API */}
                            {allTeachers.map((t) => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <button
                        onClick={handleDownload}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        ดาวน์โหลดรายงาน (.csv)
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                    {loading ? (
                        <p className="text-center text-gray-500">กำลังโหลดข้อมูล...</p>
                    ) : filteredBookings.length === 0 ? (
                        <p className="text-center text-gray-500">ไม่พบข้อมูลการจองตามเงื่อนไขที่เลือก</p>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ชื่อครู
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ระดับชั้น
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        วันที่
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        คาบเวลา
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        วันที่จอง
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.teacher}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.grade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.timeSlot}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(booking.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}