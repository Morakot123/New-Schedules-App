// pages/teacher/booking/new.jsx
// This is a placeholder page for creating a new booking.

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout'; // Adjust path if your Layout component is elsewhere (note: it's ../../../ because it's inside 'booking' folder)

export default function NewBookingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // Show loading state while session is being fetched
    if (status === 'loading') {
        return (
            <Layout>
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-xl text-gray-700 dark:text-gray-300">กำลังโหลดข้อมูล...</p>
                </div>
            </Layout>
        );
    }

    // If not authenticated or not a teacher, redirect to login page
    if (status === 'unauthenticated' || session?.user?.role !== 'teacher') {
        router.replace('/auth/login');
        return (
            <Layout>
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-xl text-red-600 dark:text-red-400">กำลังเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen p-6">
                <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                    หน้าสร้างการจองห้องปฏิบัติการใหม่
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                    หน้านี้จะเป็นที่สำหรับสร้างการจองห้องปฏิบัติการใหม่.
                    คุณสามารถเพิ่มฟอร์มและฟังก์ชันการจองได้ที่นี่.
                </p>
                {/* TODO: Add actual booking form and logic here */}
            </div>
        </Layout>
    );
}
