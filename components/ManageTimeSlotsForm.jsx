import { useEffect, useState } from 'react';

export default function ManageTimeSlotsForm({ onTimeSlotUpdate }) {
    const [timeSlots, setTimeSlots] = useState([]);
    const [newSlotName, setNewSlotName] = useState('');
    const [newSlotTime, setNewSlotTime] = useState('');
    const [editingSlot, setEditingSlot] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchTimeSlots = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/time-slots');
            if (!response.ok) throw new Error('Failed to fetch time slots');
            const data = await response.json();
            setTimeSlots(data);
        } catch (error) {
            console.error('Error fetching time slots:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newSlotName || !newSlotTime) return;
        setLoading(true);
        try {
            const response = await fetch('/api/time-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSlotName, time: newSlotTime }),
            });
            if (!response.ok) throw new Error('Failed to add time slot');
            alert('เพิ่มคาบเวลาสำเร็จ!');
            setNewSlotName('');
            setNewSlotTime('');
            fetchTimeSlots();
            onTimeSlotUpdate();
        } catch (error) {
            console.error('Error adding time slot:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มคาบเวลา');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingSlot) return;
        setLoading(true);
        try {
            const response = await fetch('/api/time-slots', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingSlot),
            });
            if (!response.ok) throw new Error('Failed to update time slot');
            alert('แก้ไขคาบเวลาสำเร็จ!');
            setEditingSlot(null);
            fetchTimeSlots();
            onTimeSlotUpdate();
        } catch (error) {
            console.error('Error updating time slot:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไขคาบเวลา');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณต้องการลบคาบเวลานี้หรือไม่?')) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/time-slots?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete time slot');
            alert('ลบคาบเวลาสำเร็จ!');
            fetchTimeSlots();
            onTimeSlotUpdate();
        } catch (error) {
            console.error('Error deleting time slot:', error);
            alert('เกิดข้อผิดพลาดในการลบคาบเวลา');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">จัดการคาบเวลา</h2>

            {/* Add Time Slot Form */}
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    placeholder="ชื่อคาบ (เช่น: คาบ 5)"
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    className="flex-grow pl-3 pr-10 py-2 border-gray-300 rounded-md"
                />
                <input
                    type="text"
                    placeholder="ช่วงเวลา (เช่น: 13:00 - 13:50)"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="flex-grow pl-3 pr-10 py-2 border-gray-300 rounded-md"
                />
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md">เพิ่ม</button>
            </form>

            {/* Time Slot List */}
            <ul className="space-y-2">
                {loading ? (
                    <p className="text-center text-gray-500">กำลังโหลด...</p>
                ) : timeSlots.length === 0 ? (
                    <p className="text-center text-gray-500">ยังไม่มีคาบเวลา</p>
                ) : (
                    timeSlots.map((slot) => (
                        <li key={slot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm">
                            {editingSlot?.id === slot.id ? (
                                <form onSubmit={handleUpdate} className="flex-grow flex gap-2">
                                    <input
                                        type="text"
                                        value={editingSlot.name}
                                        onChange={(e) => setEditingSlot({ ...editingSlot, name: e.target.value })}
                                        className="flex-grow pl-2 border-gray-300 rounded-md"
                                    />
                                    <input
                                        type="text"
                                        value={editingSlot.time}
                                        onChange={(e) => setEditingSlot({ ...editingSlot, time: e.target.value })}
                                        className="flex-grow pl-2 border-gray-300 rounded-md"
                                    />
                                    <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded-md">บันทึก</button>
                                    <button type="button" onClick={() => setEditingSlot(null)} className="px-3 py-1 bg-gray-500 text-white rounded-md">ยกเลิก</button>
                                </form>
                            ) : (
                                <>
                                    <span className="font-medium">{slot.name} ({slot.time})</span>
                                    <div className="space-x-2">
                                        <button onClick={() => setEditingSlot(slot)} className="px-2 py-1 bg-yellow-500 text-white text-sm rounded-md">แก้ไข</button>
                                        <button onClick={() => handleDelete(slot.id)} className="px-2 py-1 bg-red-600 text-white text-sm rounded-md">ลบ</button>
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