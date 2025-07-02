import { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Alert from '../../components/Alert'; // ตรวจสอบว่ามี Alert component

export default function AdminBookingsPage() {
    const { data: session, status: sessionStatus } = useSession();
    const [allBookings, setAllBookings] = useState([]); // All bookings fetched from API
    const [filteredBookings, setFilteredBookings] = useState([]); // Bookings filtered by status
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submittingId, setSubmittingId] = useState(null); // To track which booking is being approved/rejected
    const [filterStatus, setFilterStatus] = useState('pending'); // Default filter to 'pending'

    // Function to fetch all bookings from the admin API
    const fetchBookings = async () => {
        setLoading(true);
        setError(null);
        try {
            // This API endpoint should return all bookings with included relation data
            const response = await fetch('/api/admin/bookings');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || `Failed to fetch bookings: ${response.status}`);
            }

            const data = await response.json();

            // Validate if the fetched data is an array
            if (Array.isArray(data)) {
                setAllBookings(data);
                // Apply initial filter after fetching
                applyFilter(data, filterStatus);
            } else {
                // If API returns non-array data, log and throw an error
                console.error('API response for /api/admin/bookings is not an array:', data);
                throw new Error('Invalid data format received from bookings API.');
            }

        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง');
            setAllBookings([]); // Ensure states are reset to empty arrays on error
            setFilteredBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to apply filter
    const applyFilter = (bookingsData, status) => {
        if (status === 'all') {
            setFilteredBookings(bookingsData);
        } else {
            setFilteredBookings(bookingsData.filter(booking => booking.status === status));
        }
    };

    // Fetch data when component mounts or session status changes
    useEffect(() => {
        if (sessionStatus === 'authenticated') { // Only fetch if user is authenticated
            fetchBookings();
        }
    }, [sessionStatus]);

    // Re-apply filter when filterStatus changes or allBookings changes
    useEffect(() => {
        applyFilter(allBookings, filterStatus);
    }, [allBookings, filterStatus]);


    // Handle approving a booking
    const handleApprove = async (bookingId) => {
        if (!confirm('คุณต้องการอนุมัติการจองนี้หรือไม่?')) return;
        setSubmittingId(bookingId);
        setError(null);
        try {
            const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to approve booking.');
            }
            alert('อนุมัติการจองสำเร็จ!');
            fetchBookings(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error approving booking:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการอนุมัติการจอง');
        } finally {
            setSubmittingId(null);
        }
    };

    // Handle rejecting a booking
    const handleReject = async (bookingId) => {
        if (!confirm('คุณต้องการปฏิเสธการจองนี้หรือไม่?')) return;
        setSubmittingId(bookingId);
        setError(null);
        try {
            const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reject booking.');
            }
            alert('ปฏิเสธการจองสำเร็จ!');
            fetchBookings(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error rejecting booking:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการปฏิเสธการจอง');
        } finally {
            setSubmittingId(null);
        }
    };

    // Handle deleting a booking
    const handleDelete = async (bookingId) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้?')) return;
        setSubmittingId(bookingId);
        setError(null);
        try {
            const response = await fetch(`/api/admin/bookings?id=${bookingId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete booking.');
            }
            alert('ลบการจองสำเร็จ!');
            fetchBookings(); // Re-fetch to update the list
        } catch (err) {
            console.error('Error deleting booking:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการลบการจอง');
        } finally {
            setSubmittingId(null);
        }
    };


    // Authentication check
    if (sessionStatus === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    if (sessionStatus === 'unauthenticated' || session?.user?.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen p-8 text-center bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400">
                <p className="text-2xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        <div className="main-content-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
            <h1 className="page-title text-center mb-8">
                <span className="bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    📅 จัดการการจองห้องปฏิบัติการ (Admin)
                </span>
            </h1>

            {error && <Alert type="error" message={error} dismissible onClose={() => setError(null)} />}

            <div className="mx-auto max-w-4xl">
                {/* Booking Management Menu (Filters) */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">เมนูจัดการการจอง</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-md transition ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
                        >
                            ทั้งหมด
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-md transition ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
                        >
                            รอดำเนินการ
                        </button>
                        <button
                            onClick={() => setFilterStatus('approved')}
                            className={`px-4 py-2 rounded-md transition ${filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
                        >
                            อนุมัติแล้ว
                        </button>
                        <button
                            onClick={() => setFilterStatus('rejected')}
                            className={`px-4 py-2 rounded-md transition ${filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}
                        >
                            ปฏิเสธแล้ว
                        </button>
                    </div>
                </div>

                {/* Booking List Table */}
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">รายการจอง ({filterStatus === 'all' ? 'ทั้งหมด' : filterStatus === 'pending' ? 'รอดำเนินการ' : filterStatus === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว'})</h2>
                {loading ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
                ) : filteredBookings.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">ไม่มีการจองในสถานะนี้</p>
                ) : (
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วัน/เวลา</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ห้อง</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ครู</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ระดับชั้น</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {booking.date} <br /> {booking.timeSlot?.time}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {booking.room?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {booking.teacher?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {booking.grade?.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {booking.status === 'pending' && (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(booking.id)}
                                                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                                        disabled={submittingId === booking.id}
                                                    >
                                                        {submittingId === booking.id ? 'กำลังอนุมัติ...' : 'อนุมัติ'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(booking.id)}
                                                        className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                                                        disabled={submittingId === booking.id}
                                                    >
                                                        {submittingId === booking.id ? 'กำลังปฏิเสธ...' : 'ปฏิเสธ'}
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleDelete(booking.id)}
                                                className="ml-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                                disabled={submittingId === booking.id}
                                            >
                                                {submittingId === booking.id ? 'กำลังลบ...' : 'ลบ'}
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

// getServerSideProps เพื่อตรวจสอบสิทธิ์ Admin ฝั่งเซิร์ฟเวอร์
export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/denied',
                permanent: false,
            },
        };
    }
    return {
        props: { session },
    };
}
