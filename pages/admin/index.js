import { useSession, getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState(null);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    // Fetch mock statistics
    const fetchStats = async () => {
        const mockStats = {
            totalSchedules: 50,
            totalTeachers: 15,
            totalGrades: 12,
            totalTimeSlots: 8,
        };
        setStats(mockStats);
    };

    // Fetch pending bookings
    const fetchPendingBookings = async () => {
        setLoadingBookings(true);
        try {
            const res = await fetch('/api/bookings');
            const allBookings = await res.json();
            // Filter for pending bookings
            const pending = allBookings.filter(b => b.status === 'pending');
            setPendingBookings(pending);
        } catch (error) {
            console.error('Failed to fetch pending bookings:', error);
        } finally {
            setLoadingBookings(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchStats();
            fetchPendingBookings();
        }
    }, [status, session]);

    // Function to update booking status
    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            const res = await fetch(`/api/bookings?id=${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            alert(`อัปเดตสถานะการจองเรียบร้อยแล้ว: ${newStatus === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'}`);
            fetchPendingBookings(); // Refresh the list
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };

    if (status === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center text-red-600 dark:text-red-400">
                <p className="text-2xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto dark:text-white">
            <h2 className="text-4xl font-bold mb-8">แดชบอร์ดผู้ดูแลระบบ</h2>

            {/* Statistics Section */}
            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <div className="text-gray-500 dark:text-gray-400 font-semibold">จำนวนตารางเรียน</div>
                        <div className="text-4xl font-bold mt-2 text-blue-600 dark:text-blue-400">{stats.totalSchedules}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <div className="text-gray-500 dark:text-gray-400 font-semibold">จำนวนครู</div>
                        <div className="text-4xl font-bold mt-2 text-green-600 dark:text-green-400">{stats.totalTeachers}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <div className="text-gray-500 dark:text-gray-400 font-semibold">จำนวนกลุ่มเรียน</div>
                        <div className="text-4xl font-bold mt-2 text-yellow-600 dark:text-yellow-400">{stats.totalGrades}</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        <div className="text-gray-500 dark:text-gray-400 font-semibold">จำนวนคาบเวลา</div>
                        <div className="text-4xl font-bold mt-2 text-purple-600 dark:text-purple-400">{stats.totalTimeSlots}</div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500">กำลังดึงข้อมูลสถิติ...</p>
            )}

            <h3 className="text-3xl font-bold mb-6">เมนูการจัดการ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Link href="/admin/schedules">
                    <div className="flex flex-col items-center justify-center p-8 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                        <span>จัดการตารางเรียน</span>
                        <span className="text-sm mt-1">เพิ่ม/ลบ/แก้ไขตารางการจอง</span>
                    </div>
                </Link>
                <Link href="/admin/teachers">
                    <div className="flex flex-col items-center justify-center p-8 bg-green-600 hover:bg-green-700 text-white font-bold text-xl rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                        <span>จัดการครูผู้สอน</span>
                        <span className="text-sm mt-1">เพิ่ม/ลบ/แก้ไขข้อมูลครู</span>
                    </div>
                </Link>
                <Link href="/admin/grades">
                    <div className="flex flex-col items-center justify-center p-8 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-xl rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                        <span>จัดการชั้นเรียน</span>
                        <span className="text-sm mt-1">เพิ่ม/ลบ/แก้ไขข้อมูลระดับชั้น</span>
                    </div>
                </Link>
                <Link href="/admin/time-slots">
                    <div className="flex flex-col items-center justify-center p-8 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                        <span>จัดการคาบเวลา</span>
                        <span className="text-sm mt-1">เพิ่ม/ลบ/แก้ไขข้อมูลคาบเรียน</span>
                    </div>
                </Link>
                <div className="flex items-center justify-center p-8 bg-gray-400 text-white font-bold text-xl rounded-lg shadow-lg">
                    จัดการห้องแลป (เร็วๆ นี้)
                </div>
            </div>

            {/* NEW: Pending Booking Approval Section */}
            <div className="mt-12 bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
                <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                    รายการคำขอจองห้องที่รอดำเนินการ ({pendingBookings.length})
                </h3>
                {loadingBookings ? (
                    <p className="text-center text-gray-500">กำลังโหลดคำขอจอง...</p>
                ) : pendingBookings.length === 0 ? (
                    <p className="text-center text-gray-500">ไม่มีคำขอจองที่รอดำเนินการ</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ห้อง</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ครู</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับชั้น</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {pendingBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{booking.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{booking.timeSlot}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{booking.roomId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{booking.teacher}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{booking.grade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button onClick={() => updateBookingStatus(booking.id, 'approved')} className="bg-green-600 text-white px-3 py-1 rounded-md text-xs mr-2 hover:bg-green-700">
                                                อนุมัติ
                                            </button>
                                            <button onClick={() => updateBookingStatus(booking.id, 'denied')} className="bg-red-600 text-white px-3 py-1 rounded-md text-xs hover:bg-red-700">
                                                ไม่อนุมัติ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}