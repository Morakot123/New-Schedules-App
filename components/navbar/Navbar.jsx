// components/Navbar/Navbar.js
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
    HomeIcon,
    AcademicCapIcon,
    WrenchScrewdriverIcon, // For Admin Dashboard
    SunIcon,
    MoonIcon,
    ArrowRightEndOnRectangleIcon, // Login Icon
    ArrowLeftStartOnRectangleIcon, // Logout Icon
    UserGroupIcon, // For Teacher Dashboard (Example Icon)
    BookOpenIcon, // For Student Dashboard (Example Icon)
} from '@heroicons/react/24/outline'; // Make sure you have @heroicons/react installed

export default function Navbar() {
    const { data: session, status } = useSession(); // Include status for loading state
    const { theme, setTheme } = useTheme(); // Use useTheme hook

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Show a loading state for the Navbar if session is still loading
    if (status === 'loading') {
        return (
            <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <span className="text-xl font-bold text-gray-800 dark:text-white">
                        กำลังโหลด...
                    </span>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-white text-gray-800 shadow-md transition-colors duration-300 dark:bg-gray-900 dark:text-white">
            <div className="container mx-auto flex items-center justify-between p-4">
                {/* Left Section: Logo */}
                <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <Link href="/" className="text-xl font-bold transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        SLMBS
                    </Link>
                </div>

                {/* Center Section: Navigation Links */}
                <div className="hidden space-x-6 md:flex">
                    <Link href="/" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        <HomeIcon className="h-5 w-5" />
                        <span>หน้าหลัก</span>
                    </Link>

                    {/* Conditional Dashboard Links based on user role */}
                    {session?.user?.role === 'admin' && (
                        <Link href="/admin" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                            <WrenchScrewdriverIcon className="h-5 w-5" />
                            <span>แดชบอร์ดแอดมิน</span>
                        </Link>
                    )}
                    {session?.user?.role === 'teacher' && (
                        <Link href="/teacher/dashboard" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"> {/* Corrected Path */}
                            <UserGroupIcon className="h-5 w-5" /> {/* Icon for teacher dashboard */}
                            <span>แดชบอร์ดครู</span>
                        </Link>
                    )}
                    {session?.user?.role === 'student' && (
                        <Link href="/dashboard/student" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                            <BookOpenIcon className="h-5 w-5" /> {/* Icon for student dashboard */}
                            <span>แดชบอร์ดนักเรียน</span>
                        </Link>
                    )}
                    {/* Add other general links here if needed, e.g., schedules, reports, about */}
                    <Link href="/schedules" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        <span>ตารางการใช้งาน</span>
                    </Link>
                    <Link href="/report" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        <span>รายงาน</span>
                    </Link>
                    <Link href="/about" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        <span>เกี่ยวกับ</span>
                    </Link>
                </div>

                {/* Right Section: Controls */}
                <div className="flex items-center space-x-4">
                    {/* Light/Dark Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        {theme === 'dark' ? (
                            <SunIcon className="h-6 w-6 text-yellow-500" />
                        ) : (
                            <MoonIcon className="h-6 w-6 text-gray-600" />
                        )}
                    </button>

                    {/* Auth Button */}
                    {session ? (
                        <div className="flex items-center space-x-2">
                            <span className="hidden font-medium md:inline">
                                {session.user.name || session.user.email}
                            </span>
                            <button
                                onClick={() => signOut({ callbackUrl: '/auth/login' })} // Redirect to login after logout
                                className="flex items-center space-x-1 rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                            >
                                <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                                <span>ออกจากระบบ</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn()} // Let next-auth handle the callbackUrl automatically
                            className="flex items-center space-x-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
                            <span>เข้าสู่ระบบ</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
