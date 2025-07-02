// pages/teacher/dashboard.jsx
// This version limits the teacher dashboard to only "Edit Profile".

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router'; // Import useRouter for client-side redirect
import Layout from '../../components/Layout'; // Adjust path if your Layout component is elsewhere

export default function TeacherDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter(); // Initialize router

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
    // This is a client-side redirect. The page might briefly flash before redirecting.
    if (status === 'unauthenticated' || session?.user?.role !== 'teacher') {
        // Redirect to login page
        // Using router.replace instead of router.push to prevent adding to browser history
        router.replace('/auth/login');
        return (
            <Layout>
                <div className="flex min-h-screen items-center justify-center">
                    <p className="text-xl text-red-600 dark:text-red-400">กำลังเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ...</p>
                </div>
            </Layout>
        );
    }

    // Handle navigation for "Edit Profile" button
    const handleEditProfile = () => {
        // TODO: Replace '/teacher/profile/edit' with the actual path to your profile editing page
        router.push('/teacher/profile/edit');
    };

    // If authenticated and is a teacher, display the dashboard content
    return (
        <Layout>
            <div className="min-h-screen p-6">
                <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                    ยินดีต้อนรับสู่แดชบอร์ดครู, {session.user.name || session.user.email}!
                </h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-1 justify-center items-center"> {/* Centered single column */}
                    {/* Card: Edit Profile */}
                    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 max-w-md mx-auto"> {/* Added max-w-md and mx-auto for centering */}
                        <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
                            แก้ไขข้อมูลส่วนตัว
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            จัดการข้อมูลโปรไฟล์ของคุณ
                        </p>
                        <button
                            onClick={handleEditProfile}
                            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                        >
                            แก้ไขข้อมูล
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
