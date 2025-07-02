// pages/auth/register.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // กำหนดค่าเริ่มต้นเป็น 'student'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้าเว็บ

        setError(''); // ล้างข้อความผิดพลาดเก่า
        setSuccess(''); // ล้างข้อความสำเร็จเก่า

        // ตรวจสอบว่าข้อมูลครบถ้วนก่อนส่ง
        if (!name || !email || !password || !role) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน: ชื่อ, อีเมล, รหัสผ่าน, และบทบาท');
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }), // ส่งข้อมูลทั้งหมดไป
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(data.message || 'ลงทะเบียนสำเร็จ!');
                // อาจจะ redirect ไปหน้า login หรือหน้า dashboard
                router.push('/auth/login');
            } else {
                setError(data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Head>
                <title>ลงทะเบียน</title>
            </Head>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">ลงทะเบียน</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ</label>
                        <input
                            type="text"
                            id="name"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                        <input
                            type="password"
                            id="password"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
                        <select
                            id="role"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="student">นักเรียน</option>
                            <option value="teacher">ครู</option>
                            <option value="admin">ผู้ดูแลระบบ</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        ลงทะเบียน
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    มีบัญชีอยู่แล้ว?{' '}
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                    >
                        เข้าสู่ระบบที่นี่
                    </button>
                </p>
            </div>
        </div>
    );
}
