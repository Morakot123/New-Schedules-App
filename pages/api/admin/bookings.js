import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient(); // สร้างอินสแตนซ์ใหม่ของ PrismaClient

export default async function handler(req, res) {
    // การยืนยันตัวตน: อนุญาตเฉพาะผู้ดูแลระบบที่ยืนยันตัวตนแล้วเท่านั้นที่เข้าถึง API นี้ได้
    const session = await getSession({ req });
    if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
    }

    const { id } = req.query; // 'id' จะถูกใช้สำหรับ operations ที่เกี่ยวข้องกับ Booking เฉพาะเจาะจง (PUT, DELETE)

    try {
        switch (req.method) {
            // GET: ดึงข้อมูลการจองทั้งหมดสำหรับมุมมองผู้ดูแลระบบ
            // Endpoint: /api/admin/bookings
            case 'GET': { // เพิ่ม block scope เพื่อหลีกเลี่ยงข้อผิดพลาด 'redeclare'
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
            } // ปิด block scope

            // PUT: อัปเดตการจอง (เช่น เปลี่ยนสถานะจาก pending เป็น approved/rejected)
            // Endpoint: /api/admin/bookings?id=<bookingId> หรือ /api/admin/bookings/[id]
            case 'PUT': { // เพิ่ม block scope
                const updateId = id;
                const { status, teacherId, gradeId, roomId, timeSlotId, date } = req.body;

                if (!updateId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Booking ID จำเป็นสำหรับการอัปเดต' });
                }

                const updateData = {};
                if (status) updateData.status = status;
                // แปลง ID เป็น Integer หากส่งมาจาก frontend เป็น String
                if (teacherId !== undefined) updateData.teacherId = parseInt(teacherId);
                if (gradeId !== undefined) updateData.gradeId = parseInt(gradeId);
                if (roomId !== undefined) updateData.roomId = parseInt(roomId);
                if (timeSlotId !== undefined) updateData.timeSlotId = parseInt(timeSlotId);
                if (date !== undefined) updateData.date = date;


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
                    console.error('Prisma update error:', updateError);
                    if (updateError.code === 'P2025') { // ไม่พบบันทึก
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบการจองที่ต้องการอัปเดต' });
                    }
                    if (updateError.code === 'P2003') { // Foreign key constraint failed
                        return res.status(400).json({ error: 'Bad Request', message: 'ข้อมูลที่เชื่อมโยงไม่ถูกต้อง (เช่น Teacher ID, Grade ID, Room ID, Time Slot ID)' });
                    }
                    throw updateError; // ส่ง error อื่นๆ กลับไป
                }
                break;
            } // ปิด block scope

            // DELETE: ลบการจอง
            // Endpoint: /api/admin/bookings?id=<bookingId> หรือ /api/admin/bookings/[id]
            case 'DELETE': { // เพิ่ม block scope
                const deleteId = id;

                if (!deleteId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Booking ID จำเป็นสำหรับการลบ' });
                }

                try {
                    await prisma.booking.delete({
                        where: { id: parseInt(deleteId) },
                    });
                    res.status(200).json({ message: 'ลบการจองสำเร็จ' });
                } catch (deleteError) {
                    console.error('Prisma delete error:', deleteError);
                    if (deleteError.code === 'P2025') { // ไม่พบบันทึก
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบการจองที่ต้องการลบ' });
                    }
                    throw deleteError; // ส่ง error อื่นๆ กลับไป
                }
                break;
            } // ปิด block scope

            // จัดการ methods อื่นๆ ที่ไม่ได้กำหนดไว้อย่างชัดเจน
            default: { // เพิ่ม block scope
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                break;
            } // ปิด block scope
        }
    } catch (error) {
        console.error('API Error (admin/bookings):', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    } finally {
        await prisma.$disconnect(); // ตัดการเชื่อมต่อ Prisma client
    }
}
