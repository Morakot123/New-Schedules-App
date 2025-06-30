import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialMode = savedTheme ? savedTheme === 'dark' : prefersDark;
        setIsDarkMode(initialMode);
        document.documentElement.classList.toggle('dark', initialMode);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo & Main Links (Left & Center) */}
                    <div className="flex items-center">
                        <Link href="/">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer transition-colors duration-300">
                                LAB MANAGER
                            </span>
                        </Link>
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            <Link href="/">
                                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium cursor-pointer transition-colors duration-300">
                                    หน้าหลัก
                                </span>
                            </Link>
                            <Link href="/schedules">
                                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium cursor-pointer transition-colors duration-300">
                                    ตารางการใช้งาน
                                </span>
                            </Link>
                            <Link href="/report">
                                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium cursor-pointer transition-colors duration-300">
                                    รายงาน
                                </span>
                            </Link>
                            <Link href="/about">
                                <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium cursor-pointer transition-colors duration-300">
                                    เกี่ยวกับ
                                </span>
                            </Link>
                            {session?.user?.role === 'admin' && (
                                <Link href="/admin">
                                    <span className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium cursor-pointer transition-colors duration-300">
                                        แดชบอร์ด
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Controls (Right) */}
                    <div className="flex items-center space-x-4">
                        {/* Dark Mode Toggle */}
                        <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">
                            {isDarkMode ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                            )}
                        </button>

                        {/* Login / Logout Button */}
                        {session ? (
                            <button onClick={() => signOut()} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors duration-300">
                                ออกจากระบบ
                            </button>
                        ) : (
                            <Link href="/login">
                                <span className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 cursor-pointer transition-colors duration-300">
                                    เข้าสู่ระบบ
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}