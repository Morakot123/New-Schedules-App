// pages/index.js
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* SVG Logo for Smart Lab */}
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
            <path d="M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 13H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
          </svg>
          <span className="bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">
            ระบบบริหารจัดการและจองห้องปฏิบัติการอัจฉริยะ
          </span>
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-8">
          (Smart Lab Management and Booking System - SLMBS)
        </h2>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          ระบบที่ช่วยให้คุณจัดการตารางเรียนและการจองการใช้งานห้องปฏิบัติการได้อย่างง่ายดายและมีประสิทธิภาพ
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/schedules" passHref>
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
              ดูตารางการใช้งาน
            </button>
          </Link>
          {status === 'unauthenticated' && (
            <Link href="/auth/login" passHref>
              <button className="px-8 py-4 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50">
                เข้าสู่ระบบ
              </button>
            </Link>
          )}
          {status === 'unauthenticated' && (
            <Link href="/register" passHref>
              <button className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50">
                สมัครสมาชิก
              </button>
            </Link>
          )}
          {status === 'authenticated' && session?.user?.role === 'admin' && (
            <Link href="/admin" passHref>
              <button className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-50">
                แดชบอร์ดผู้ดูแลระบบ
              </button>
            </Link>
          )}
          {status === 'authenticated' && session?.user?.role === 'teacher' && (
            <Link href="/teacher/dashboard" passHref>
              <button className="px-8 py-4 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50">
                แดชบอร์ดครู
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
