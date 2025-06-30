import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // สร้างอินสแตนซ์ใหม่ของ PrismaClient

export default async function handler(req, res) {
    const { id } = req.query; // 'id' จะถูกใช้สำหรับ operations ที่เกี่ยวข้องกับห้องเฉพาะเจาะจง

    try {
        switch (req.method) {
            case 'GET': { // เพิ่ม block scope
                const rooms = await prisma.lab.findMany({ // สมมติว่าใช้ Lab model สำหรับห้อง
                    orderBy: {
                        name: 'asc', // เรียงตามชื่อห้องจากน้อยไปมาก
                    },
                });
                res.status(200).json(rooms);
                break;
            } // ปิด block scope

            case 'POST': { // เพิ่ม block scope
                const { name } = req.body; // สมมติว่าต้องการเพียงชื่อสำหรับห้องใหม่
                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Room name is required.' });
                }
                // ตรวจสอบว่ามีห้องที่มีชื่อเดียวกันอยู่แล้วหรือไม่
                const existingRoom = await prisma.lab.findUnique({
                    where: { name: name.trim() },
                });
                if (existingRoom) {
                    return res.status(409).json({ error: 'Conflict', message: 'Room with this name already exists.' });
                }

                const newRoom = await prisma.lab.create({
                    data: { name: name.trim() },
                });
                res.status(201).json(newRoom);
                break;
            } // ปิด block scope

            case 'PUT': { // เพิ่ม block scope
                const updateId = id;
                const { name: newName } = req.body;
                if (!updateId || !newName || newName.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Room ID and new name are required.' });
                }
                try {
                    // ตรวจสอบว่ามีชื่อใหม่นี้อยู่แล้วสำหรับห้องอื่นหรือไม่
                    const existingRoomWithName = await prisma.lab.findUnique({
                        where: { name: newName.trim() },
                    });
                    if (existingRoomWithName && String(existingRoomWithName.id) !== String(updateId)) {
                        return res.status(409).json({ error: 'Conflict', message: 'Another room with this name already exists.' });
                    }

                    const updatedRoom = await prisma.lab.update({
                        where: { id: parseInt(updateId) },
                        data: { name: newName.trim() },
                    });
                    res.status(200).json(updatedRoom);
                } catch (updateError) {
                    if (updateError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'Room not found.' });
                    }
                    throw updateError;
                }
                break;
            } // ปิด block scope

            case 'DELETE': { // เพิ่ม block scope
                const deleteId = id;
                if (!deleteId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Room ID is required for deletion.' });
                }
                try {
                    await prisma.lab.delete({
                        where: { id: parseInt(deleteId) },
                    });
                    res.status(200).json({ message: 'Room deleted successfully.' });
                } catch (deleteError) {
                    if (deleteError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'Room not found.' });
                    }
                    if (deleteError.code === 'P2003') { // การละเมิด Foreign key constraint
                        return res.status(409).json({ error: 'Conflict', message: 'Cannot delete room because it is linked to existing schedules or bookings.' });
                    }
                    throw deleteError;
                }
                break;
            } // ปิด block scope

            default: { // เพิ่ม block scope
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                break;
            } // ปิด block scope
        }
    } catch (error) {
        console.error('API Error (rooms):', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred.' });
    } finally {
        await prisma.$disconnect();
    }
}
