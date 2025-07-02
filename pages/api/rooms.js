import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react'; // ใช้สำหรับตรวจสอบสิทธิ์ Admin

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query; // 'id' จะถูกใช้สำหรับ operations ที่เกี่ยวข้องกับห้องเฉพาะเจาะจง

    try {
        switch (req.method) {
            case 'GET': {
                // สำหรับ GET request: ไม่จำเป็นต้องตรวจสอบสิทธิ์ Admin
                // อนุญาตให้ผู้ใช้ทุกคนสามารถดูข้อมูลห้องปฏิบัติการได้
                const rooms = await prisma.lab.findMany({
                    orderBy: {
                        name: 'asc', // เรียงตามชื่อห้องจากน้อยไปมาก
                    },
                });
                res.status(200).json(rooms);
                break;
            }

            case 'POST':
            case 'PUT':
            case 'DELETE': {
                // สำหรับ POST, PUT, DELETE request: ต้องตรวจสอบสิทธิ์ Admin เท่านั้น
                const session = await getSession({ req });
                if (!session || session.user.role !== 'admin') {
                    return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
                }

                if (req.method === 'POST') {
                    const { name, roomNumber, capacity } = req.body; // รับฟิลด์ใหม่เข้ามา

                    // ตรวจสอบข้อมูลที่จำเป็น
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

                    // สร้างข้อมูลสำหรับบันทึก
                    const createData = {
                        name: name.trim(),
                    };
                    if (roomNumber && roomNumber.trim() !== '') {
                        createData.roomNumber = roomNumber.trim();
                    }
                    if (capacity !== undefined && capacity !== null && !isNaN(parseInt(capacity))) {
                        createData.capacity = parseInt(capacity);
                    }

                    const newRoom = await prisma.lab.create({
                        data: createData,
                    });
                    res.status(201).json(newRoom);
                } else if (req.method === 'PUT') {
                    const updateId = id;
                    const { name: newName, roomNumber: newRoomNumber, capacity: newCapacity } = req.body;

                    if (!updateId) {
                        return res.status(400).json({ error: 'Bad Request', message: 'Room ID is required for update.' });
                    }

                    const updateData = {};
                    if (newName && newName.trim() !== '') {
                        updateData.name = newName.trim();
                    }
                    if (newRoomNumber !== undefined) {
                        updateData.roomNumber = newRoomNumber.trim() === '' ? null : newRoomNumber.trim();
                    }
                    if (newCapacity !== undefined) {
                        updateData.capacity = (newCapacity === null || String(newCapacity).trim() === '' || isNaN(parseInt(newCapacity))) ? null : parseInt(newCapacity);
                    }

                    if (Object.keys(updateData).length === 0) {
                        return res.status(400).json({ error: 'Bad Request', message: 'No data provided for update.' });
                    }

                    try {
                        if (updateData.name) {
                            const existingRoomWithName = await prisma.lab.findUnique({
                                where: { name: updateData.name },
                            });
                            if (existingRoomWithName && String(existingRoomWithName.id) !== String(updateId)) {
                                return res.status(409).json({ error: 'Conflict', message: 'Another room with this name already exists.' });
                            }
                        }

                        const updatedRoom = await prisma.lab.update({
                            where: { id: parseInt(updateId) },
                            data: updateData,
                        });
                        res.status(200).json(updatedRoom);
                    } catch (updateError) {
                        if (updateError.code === 'P2025') {
                            return res.status(404).json({ error: 'Not Found', message: 'Room not found.' });
                        }
                        throw updateError;
                    }
                } else if (req.method === 'DELETE') {
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
                        if (deleteError.code === 'P2003') {
                            return res.status(409).json({ error: 'Conflict', message: 'Cannot delete room because it is linked to existing schedules or bookings.' });
                        }
                        throw deleteError;
                    }
                }
                break;
            }

            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                break;
            }
        }
    } catch (error) {
        console.error('API Error (rooms):', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred.' });
    } finally {
        await prisma.$disconnect();
    }
}
