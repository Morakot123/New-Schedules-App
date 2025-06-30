import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-down">
        ยินดีต้อนรับสู่ <br /> ระบบจัดการห้องปฏิบัติการ
      </h1>
      <p className="text-lg md:text-xl max-w-2xl mb-10 text-gray-600 dark:text-gray-300 animate-fade-in">
        ระบบที่ช่วยให้คุณจัดการตารางเรียนและจองการใช้งานห้องปฏิบัติการได้อย่างง่ายดายและมีประสิทธิภาพ
      </p>
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
        <Link href="/schedules">
          <span className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-xl hover:bg-blue-700 transition-transform transform hover:scale-105 cursor-pointer">
            ดูตารางการใช้งาน
          </span>
        </Link>
        <Link href="/login">
          <span className="px-8 py-4 bg-gray-200 text-gray-800 text-lg font-bold rounded-lg shadow-xl hover:bg-gray-300 transition-transform transform hover:scale-105 cursor-pointer">
            เข้าสู่ระบบ
          </span>
        </Link>
        {/* NEW: Register Button */}
        <Link href="/register">
          <span className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-lg shadow-xl hover:bg-green-700 transition-transform transform hover:scale-105 cursor-pointer">
            สมัครสมาชิก
          </span>
        </Link>
      </div>
    </div>
  );
}