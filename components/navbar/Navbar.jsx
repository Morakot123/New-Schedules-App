import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
    HomeIcon,
    AcademicCapIcon,
    WrenchScrewdriverIcon,
    SunIcon,
    MoonIcon,
    ArrowRightEndOnRectangleIcon,
    ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <nav className="bg-white text-gray-800 shadow-md transition-colors duration-300 dark:bg-gray-900 dark:text-white">
            <div className="container mx-auto flex items-center justify-between p-4">
                {/* Left Section: Logo */}
                <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <Link href="/" className="text-xl font-bold transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        Lab Schedule
                    </Link>
                </div>

                {/* Center Section: Navigation Links */}
                <div className="hidden space-x-6 md:flex">
                    <Link href="/" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        <HomeIcon className="h-5 w-5" />
                        <span>หน้าหลัก</span>
                    </Link>
                    {session?.user?.role === 'admin' && (
                        <Link href="/admin" className="flex items-center space-x-1 font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                            <WrenchScrewdriverIcon className="h-5 w-5" />
                            <span>แดชบอร์ดแอดมิน</span>
                        </Link>
                    )}
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
                                onClick={() => signOut()}
                                className="flex items-center space-x-1 rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
                            >
                                <ArrowLeftStartOnRectangleIcon className="h-5 w-5" />
                                <span>ออกจากระบบ</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn()}
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