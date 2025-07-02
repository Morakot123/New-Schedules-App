// pages/teacher/profile/edit.jsx
// This is a placeholder page for editing teacher's profile.

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout'; // Adjust path if your Layout component is elsewhere (note: it's ../../../ because it's inside 'profile' folder)

export default function EditTeacherProfilePage() {
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
                    หน้าแก้ไขข้อมูลส่วนตัวครู
                </h1>
                <p className="text-gray-700 dark:text-gray-300">
                    หน้านี้จะเป็นที่สำหรับแก้ไขข้อมูลโปรไฟล์ของคุณ.
                    คุณสามารถเพิ่มฟอร์มและฟังก์ชันการแก้ไขข้อมูลได้ที่นี่.
                </p>
                {/* TODO: Add actual profile editing form and logic here */}
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                    ข้อมูลผู้ใช้ปัจจุบัน: <span className="font-semibold">{session.user.email}</span>
                </p>
            </div>
        </Layout>
    );
}
