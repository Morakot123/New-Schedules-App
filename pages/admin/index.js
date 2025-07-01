// pages/admin/index.js
import { getSession, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = useState({
        totalSchedules: 0,
        totalTeachers: 0,
        totalClassGroups: 0,
        totalLabs: 0, // เปลี่ยนจาก totalLabs เป็น totalRooms เพื่อให้สอดคล้องกับ API /api/rooms
        pendingBookings: 0, // เพิ่มสำหรับจำนวนการจองที่รอดำเนินการ
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [errorStats, setErrorStats] = useState(null);

    // ฟังก์ชันสำหรับดึงข้อมูลสถิติจาก API
    const fetchStats = async () => {
        setLoadingStats(true);
        setErrorStats(null);
        try {
            // ดึงข้อมูลตารางเรียน
            const schedulesRes = await fetch('/api/admin/schedules');
            const schedulesData = await schedulesRes.json();
            const totalSchedules = schedulesData.length;

            // ดึงข้อมูลครู
            const teachersRes = await fetch('/api/teachers');
            const teachersData = await teachersRes.json();
            const totalTeachers = teachersData.length;

            // ดึงข้อมูลกลุ่มชั้นเรียน
            const classGroupsRes = await fetch('/api/class-groups');
            const classGroupsData = await classGroupsRes.json();
            const totalClassGroups = classGroupsData.length;

            // ดึงข้อมูลห้องปฏิบัติการ (ใช้ /api/rooms)
            const labsRes = await fetch('/api/rooms'); // ใช้ /api/rooms
            const labsData = await labsRes.json();
            const totalLabs = labsData.length; // เปลี่ยนชื่อตัวแปรเป็น totalLabs

            // ดึงข้อมูลการจองที่รอดำเนินการ
            const bookingsRes = await fetch('/api/admin/bookings');
            const bookingsData = await bookingsRes.json();
            const pendingBookings = bookingsData.filter(booking => booking.status === 'pending').length;


            setStats({
                totalSchedules,
                totalTeachers,
                totalClassGroups,
                totalLabs, // อัปเดตตรงนี้
                pendingBookings,
            });
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setErrorStats('ไม่สามารถโหลดข้อมูลสถิติได้');
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated' && session.user.role === 'admin') {
            fetchStats();
        }
    }, [session, status]);


    // การตรวจสอบสิทธิ์การเข้าถึง: แสดงหน้า Loading หรือ Denied ถ้าไม่มีสิทธิ์
    if (status === 'loading') {
        return <div className="text-center p-10 dark:text-gray-300">กำลังโหลด...</div>;
    }

    if (!session || session.user.role !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen p-8 text-center bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400">
                <p className="text-2xl font-bold">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
            </div>
        );
    }

    return (
        <div className="main-content-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen">
            <h1 className="page-title text-center mb-8">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    📊 แดชบอร์ดผู้ดูแลระบบ
                </span>
            </h1>

            {errorStats && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
                    <span className="block sm:inline"> {errorStats}</span>
                </div>
            )}

            {/* สถิติสรุป */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">สถิติสรุป</h2>
            {loadingStats ? (
                <p className="text-center text-gray-500 dark:text-gray-400">กำลังโหลดสถิติ...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">จำนวนตารางเรียน</p>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSchedules}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">จำนวนครู</p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.totalTeachers}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">จำนวนกลุ่มเรียน</p>
                        <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalClassGroups}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">จำนวนห้องปฏิบัติการ</p> {/* เปลี่ยนคำศัพท์ */}
                        <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.totalLabs}</p> {/* เปลี่ยนชื่อตัวแปร */}
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center col-span-full">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">รายการจองที่รอดำเนินการ</p>
                        <p className="text-4xl font-bold text-red-600 dark:text-red-400">{stats.pendingBookings}</p>
                    </div>
                </div>
            )}

            {/* เมนูการจัดการ */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">เมนูการจัดการ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/admin/schedules" passHref>
                    <div className="flex flex-col items-center justify-center p-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition cursor-pointer">
                        <span className="text-4xl mb-2">🗓️</span>
                        <p className="text-xl font-bold">จัดการตารางเรียน</p>
                        <p className="text-sm">เพิ่ม/แก้ไข/ลบตารางเรียน</p>
                    </div>
                </Link>
                <Link href="/admin/teachers" passHref>
                    <div className="flex flex-col items-center justify-center p-6 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition cursor-pointer">
                        <span className="text-4xl mb-2">🧑‍🏫</span>
                        <p className="text-xl font-bold">จัดการครูผู้สอน</p>
                        <p className="text-sm">เพิ่ม/แก้ไข/ลบข้อมูลครู</p>
                    </div>
                </Link>
                <Link href="/admin/grades" passHref>
                    <div className="flex flex-col items-center justify-center p-6 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition cursor-pointer">
                        <span className="text-4xl mb-2">🏫</span>
                        <p className="text-xl font-bold">จัดการชั้นเรียน</p>
                        <p className="text-sm">เพิ่ม/แก้ไข/ลบระดับชั้น</p>
                    </div>
                </Link>
                <Link href="/admin/time-slots" passHref>
                    <div className="flex flex-col items-center justify-center p-6 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition cursor-pointer">
                        <span className="text-4xl mb-2">⏰</span>
                        <p className="text-xl font-bold">จัดการคาบเวลา</p>
                        <p className="text-sm">เพิ่ม/แก้ไข/ลบคาบเวลา</p>
                    </div>
                </Link>
                {/* *** ปุ่มสำหรับจัดการห้องปฏิบัติการ *** */}
                <Link href="/admin/labs" passHref>
                    <div className="flex flex-col items-center justify-center p-6 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition cursor-pointer">
                        <span className="text-4xl mb-2">💻</span> {/* เปลี่ยนไอคอน */}
                        <p className="text-xl font-bold">จัดการห้องปฏิบัติการ</p> {/* เปลี่ยนคำศัพท์ */}
                        <p className="text-sm">เพิ่ม/แก้ไข/ลบข้อมูลห้องปฏิบัติการ</p> {/* เปลี่ยนคำศัพท์ */}
                    </div>
                </Link>
                <Link href="/admin/bookings" passHref>
                    <div className="flex flex-col items-center justify-center p-6 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition cursor-pointer">
                        <span className="text-4xl mb-2">📝</span>
                        <p className="text-xl font-bold">จัดการการจอง</p>
                        <p className="text-sm">อนุมัติ/ปฏิเสธ/ลบการจอง</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

// getServerSideProps สำหรับการตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์
export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session || session.user.role !== 'admin') {
        return {
            redirect: {
                destination: '/denied', // หรือหน้าที่แสดงการเข้าถึงถูกปฏิเสธ
                permanent: false,
            },
        };
    }

    return {
        props: { session },
    };
}
