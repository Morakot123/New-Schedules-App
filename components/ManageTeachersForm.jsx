import { useEffect, useState } from 'react';

export default function ManageTeachersForm({ onTeacherUpdate }) {
    const [teachers, setTeachers] = useState([]);
    const [newTeacherName, setNewTeacherName] = useState('');
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/teachers');
            if (!response.ok) throw new Error('Failed to fetch teachers');
            const data = await response.json();
            setTeachers(data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTeacherName) return;
        setLoading(true);
        try {
            const response = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeacherName }),
            });
            if (!response.ok) throw new Error('Failed to add teacher');
            alert('เพิ่มรายชื่อครูสำเร็จ!');
            setNewTeacherName('');
            fetchTeachers();
            onTeacherUpdate();
        } catch (error) {
            console.error('Error adding teacher:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มรายชื่อครู');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingTeacher) return;
        setLoading(true);
        try {
            const response = await fetch('/api/teachers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTeacher),
            });
            if (!response.ok) throw new Error('Failed to update teacher');
            alert('แก้ไขรายชื่อครูสำเร็จ!');
            setEditingTeacher(null);
            fetchTeachers();
            onTeacherUpdate();
        } catch (error) {
            console.error('Error updating teacher:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไขรายชื่อครู');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบรายชื่อครูนี้หรือไม่?')) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/teachers?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete teacher');
            alert('ลบรายชื่อครูสำเร็จ!');
            fetchTeachers();
            onTeacherUpdate();
        } catch (error) {
            console.error('Error deleting teacher:', error);
            alert('เกิดข้อผิดพลาดในการลบรายชื่อครู');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">จัดการรายชื่อครู</h2>

            {/* Add Teacher Form */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="เพิ่มชื่อครูใหม่"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="flex-grow pl-3 pr-10 py-2 border-gray-300 rounded-md"
                />
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md">เพิ่ม</button>
            </form>

            {/* Teacher List */}
            <ul className="space-y-2">
                {loading ? (
                    <p className="text-center text-gray-500">กำลังโหลด...</p>
                ) : teachers.length === 0 ? (
                    <p className="text-center text-gray-500">ยังไม่มีรายชื่อครู</p>
                ) : (
                    teachers.map((teacher) => (
                        <li key={teacher.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm">
                            {editingTeacher?.id === teacher.id ? (
                                <form onSubmit={handleUpdate} className="flex-grow flex gap-2">
                                    <input
                                        type="text"
                                        value={editingTeacher.name}
                                        onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                                        className="flex-grow pl-2 border-gray-300 rounded-md"
                                    />
                                    <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded-md">บันทึก</button>
                                    <button type="button" onClick={() => setEditingTeacher(null)} className="px-3 py-1 bg-gray-500 text-white rounded-md">ยกเลิก</button>
                                </form>
                            ) : (
                                <>
                                    <span className="font-medium">{teacher.name}</span>
                                    <div className="space-x-2">
                                        <button onClick={() => setEditingTeacher(teacher)} className="px-2 py-1 bg-yellow-500 text-white text-sm rounded-md">แก้ไข</button>
                                        <button onClick={() => handleDelete(teacher.id)} className="px-2 py-1 bg-red-600 text-white text-sm rounded-md">ลบ</button>
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