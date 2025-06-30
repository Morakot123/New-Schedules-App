import { useState } from 'react';

export default function AddTeacherForm({ onTeacherAdded }) {
    const [teacherName, setTeacherName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: teacherName }),
            });
            if (!response.ok) throw new Error('Failed to add teacher');
            alert('เพิ่มรายชื่อครูสำเร็จ!');
            setTeacherName('');
            onTeacherAdded(); // Call parent function to refresh the list
        } catch (error) {
            console.error('Error adding teacher:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มรายชื่อครู');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">เพิ่มรายชื่อครู</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="ชื่อครู"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    required
                    className="flex-grow pl-3 pr-10 py-2 border-gray-300 rounded-md"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex-shrink-0 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'กำลังบันทึก...' : 'เพิ่มครู'}
                </button>
            </form>
        </div>
    );
}