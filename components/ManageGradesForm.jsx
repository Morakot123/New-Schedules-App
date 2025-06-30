import { useEffect, useState } from 'react';

export default function ManageGradesForm({ onGradeUpdate }) {
    const [grades, setGrades] = useState([]);
    const [newGradeName, setNewGradeName] = useState('');
    const [editingGrade, setEditingGrade] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/grades');
            if (!response.ok) throw new Error('Failed to fetch grades');
            const data = await response.json();
            setGrades(data);
        } catch (error) {
            console.error('Error fetching grades:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrades();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newGradeName) return;
        setLoading(true);
        try {
            const response = await fetch('/api/grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newGradeName }),
            });
            if (!response.ok) throw new Error('Failed to add grade');
            alert('เพิ่มระดับชั้นสำเร็จ!');
            setNewGradeName('');
            fetchGrades();
            onGradeUpdate();
        } catch (error) {
            console.error('Error adding grade:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มระดับชั้น');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingGrade) return;
        setLoading(true);
        try {
            const response = await fetch('/api/grades', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingGrade),
            });
            if (!response.ok) throw new Error('Failed to update grade');
            alert('แก้ไขระดับชั้นสำเร็จ!');
            setEditingGrade(null);
            fetchGrades();
            onGradeUpdate();
        } catch (error) {
            console.error('Error updating grade:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไขระดับชั้น');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบระดับชั้นนี้หรือไม่?')) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/grades?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete grade');
            alert('ลบระดับชั้นสำเร็จ!');
            fetchGrades();
            onGradeUpdate();
        } catch (error) {
            console.error('Error deleting grade:', error);
            alert('เกิดข้อผิดพลาดในการลบระดับชั้น');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">จัดการระดับชั้น</h2>

            {/* Add Grade Form */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="เพิ่มระดับชั้นใหม่ (เช่น: ม.1)"
                    value={newGradeName}
                    onChange={(e) => setNewGradeName(e.target.value)}
                    className="flex-grow pl-3 pr-10 py-2 border-gray-300 rounded-md"
                />
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md">เพิ่ม</button>
            </form>

            {/* Grade List */}
            <ul className="space-y-2">
                {loading ? (
                    <p className="text-center text-gray-500">กำลังโหลด...</p>
                ) : grades.length === 0 ? (
                    <p className="text-center text-gray-500">ยังไม่มีระดับชั้น</p>
                ) : (
                    grades.map((grade) => (
                        <li key={grade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm">
                            {editingGrade?.id === grade.id ? (
                                <form onSubmit={handleUpdate} className="flex-grow flex gap-2">
                                    <input
                                        type="text"
                                        value={editingGrade.name}
                                        onChange={(e) => setEditingGrade({ ...editingGrade, name: e.target.value })}
                                        className="flex-grow pl-2 border-gray-300 rounded-md"
                                    />
                                    <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded-md">บันทึก</button>
                                    <button type="button" onClick={() => setEditingGrade(null)} className="px-3 py-1 bg-gray-500 text-white rounded-md">ยกเลิก</button>
                                </form>
                            ) : (
                                <>
                                    <span className="font-medium">{grade.name}</span>
                                    <div className="space-x-2">
                                        <button onClick={() => setEditingGrade(grade)} className="px-2 py-1 bg-yellow-500 text-white text-sm rounded-md">แก้ไข</button>
                                        <button onClick={() => handleDelete(grade.id)} className="px-2 py-1 bg-red-600 text-white text-sm rounded-md">ลบ</button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}