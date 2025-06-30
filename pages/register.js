import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // --- NOTE: This is a mock registration process for the demo ---
        // In a real app, you would send this data to a real database.
        try {
            // Here you would call an API like `/api/register`
            // const response = await fetch('/api/register', { ... });
            // if (!response.ok) throw new Error('Registration failed');

            // Mock success for demonstration
            console.log('User registered:', { name, email, password, role: 'teacher' });
            alert('สมัครสมาชิกสำเร็จแล้ว! คุณสามารถเข้าสู่ระบบได้เลย');
            router.push('/login');
        } catch (err) {
            setError('เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-6 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 transition-colors duration-300">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">สมัครสมาชิก</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ชื่อ-นามสกุล</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">อีเมล</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">รหัสผ่าน</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors duration-300">
                        {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
                    </button>
                </form>
            </div>
        </div>
    );
}