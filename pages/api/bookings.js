import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // สร้างอินสแตนซ์ใหม่ของ PrismaClient

export default async function handler(req, res) {
    const { id } = req.query; // 'id' จะถูกใช้สำหรับ operations ที่เกี่ยวข้องกับ Booking เฉพาะเจาะจง (PUT, DELETE)

    try {
        switch (req.method) {
            // GET: ดึงข้อมูลการจองทั้งหมด
            // Endpoint: /api/bookings
            case 'GET': {
                // ดึงการจองทั้งหมดและรวมข้อมูลความสัมพันธ์ที่เกี่ยวข้องสำหรับการแสดงผล
                const bookings = await prisma.booking.findMany({
                    include: {
                        teacher: true,   // รวมอ็อบเจกต์ครู
                        grade: true,     // รวมอ็อบเจกต์ระดับชั้น
                        room: true,      // รวมอ็อบเจกต์ห้อง (Lab)
                        timeSlot: true,  // รวมอ็อบเจกต์ช่วงเวลา
                    },
                    orderBy: [
                        { date: 'asc' },      // เรียงตามวันที่จากน้อยไปมาก
                        { timeSlot: { time: 'asc' } }, // จากนั้นเรียงตามเวลาของช่วงเวลาจากน้อยไปมาก
                    ],
                });
                res.status(200).json(bookings);
                break;
            }

            // POST: สร้างการจองใหม่
            // Endpoint: /api/bookings
            case 'POST': {
                // คาดหวัง IDs สำหรับความสัมพันธ์และสตริงวันที่
                const { teacherId, gradeId, date, timeSlotId, roomId } = req.body;

                // การตรวจสอบพื้นฐานสำหรับฟิลด์ที่จำเป็น
                if (!teacherId || !gradeId || !date || !timeSlotId || !roomId ||
                    date.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields for booking.' });
                }

                try {
                    // สร้างการจองใหม่โดยใช้ Prisma
                    const newBooking = await prisma.booking.create({
                        data: {
                            teacherId: parseInt(teacherId), // แปลง ID เป็น Integer
                            gradeId: parseInt(gradeId),
                            date: date.trim(),
                            timeSlotId: parseInt(timeSlotId),
                            roomId: parseInt(roomId),
                            status: 'pending', // สถานะเริ่มต้นสำหรับการจองใหม่
                        },
                        include: { // รวมความสัมพันธ์ใน Response สำหรับการอัปเดต frontend ทันที
                            teacher: true, grade: true, room: true, timeSlot: true
                        },
                    });
                    res.status(201).json(newBooking);
                } catch (createError) {
                    console.error('Prisma create booking error:', createError);
                    if (createError.code === 'P2003') {
                        return res.status(400).json({ error: 'Bad Request', message: 'ข้อมูลที่เชื่อมโยงไม่ถูกต้อง (เช่น Teacher ID, Grade ID, Room ID, Time Slot ID ไม่ถูกต้อง)' });
                    }
                    if (createError.code === 'P2002') {
                        return res.status(409).json({ error: 'Conflict', message: 'มีการจองในช่วงเวลานี้แล้ว' });
                    }
                    throw createError;
                }
            }

            // PUT: อัปเดตการจองที่มีอยู่ (เช่น สถานะ หรือฟิลด์อื่นๆ)
            // Endpoint: /api/bookings?id=<bookingId>
            case 'PUT': {
                const updateId = id;
                const { status, teacherId, gradeId, date, timeSlotId, roomId } = req.body;

                if (!updateId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Booking ID จำเป็นสำหรับการอัปเดต' });
                }

                const updateData = {};
                if (status) updateData.status = status;
                if (teacherId !== undefined) updateData.teacherId = parseInt(teacherId);
                if (gradeId !== undefined) updateData.gradeId = parseInt(gradeId);
                if (date !== undefined) updateData.date = date.trim();
                if (timeSlotId !== undefined) updateData.timeSlotId = parseInt(timeSlotId);
                if (roomId !== undefined) updateData.roomId = parseInt(roomId);

                if (Object.keys(updateData).length === 0) {
                    return res.status(400).json({ error: 'Bad Request', message: 'ไม่มีข้อมูลให้อัปเดต' });
                }

                try {
                    const updatedBooking = await prisma.booking.update({
                        where: { id: parseInt(updateId) },
                        data: updateData,
                        include: {
                            teacher: true, grade: true, room: true, timeSlot: true
                        },
                    });
                    res.status(200).json(updatedBooking);
                } catch (updateError) {
                    console.error('Prisma update booking error:', updateError);
                    if (updateError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบการจองที่ต้องการอัปเดต' });
                    }
                    if (updateError.code === 'P2003') {
                        return res.status(400).json({ error: 'Bad Request', message: 'ข้อมูลที่เชื่อมโยงไม่ถูกต้อง' });
                    }
                    throw updateError;
                }
            }

            // DELETE: ลบการจองโดยใช้ ID
            // Endpoint: /api/bookings?id=<bookingId>
            case 'DELETE': {
                const deleteId = id;
                if (!deleteId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Booking ID จำเป็นสำหรับการลบ' });
                }
                try {
                    await prisma.booking.delete({
                        where: { id: parseInt(deleteId) },
                    });
                    res.status(200).json({ message: 'Booking deleted successfully' });
                } catch (deleteError) {
                    console.error('Prisma delete booking error:', deleteError);
                    if (deleteError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบการจองที่ต้องการลบ' });
                    }
                    throw deleteError;
                }
            }

            // จัดการ methods ที่ไม่ได้กำหนดไว้อย่างชัดเจน
            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                break;
            }
        }
    } catch (error) {
        console.error('API Error (bookings):', error);
        res.status(500).json({ error: 'Internal server error', message: error.message || 'An unexpected error occurred.' });
    } finally {
        await prisma.$disconnect(); // ตัดการเชื่อมต่อ Prisma client
    }
}
