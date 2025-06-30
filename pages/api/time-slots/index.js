import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // สร้างอินสแตนซ์ใหม่ของ PrismaClient

export default async function handler(req, res) {
    const { id } = req.query; // 'id' จะถูกใช้สำหรับ operations ที่เกี่ยวข้องกับ Time Slot เฉพาะเจาะจง

    try {
        switch (req.method) {
            // GET: ดึงช่วงเวลาทั้งหมดจากฐานข้อมูล
            case 'GET': { // เพิ่ม block scope
                const timeSlots = await prisma.timeSlot.findMany({
                    orderBy: {
                        time: 'asc', // เรียงช่วงเวลาตามสตริงเวลาจากน้อยไปมาก (เช่น "09:00" ก่อน "10:00")
                    },
                });
                res.status(200).json(timeSlots);
                break;
            } // ปิด block scope

            // POST: สร้างช่วงเวลาใหม่
            case 'POST': { // เพิ่ม block scope
                const { time } = req.body;
                // ตรวจสอบข้อมูลนำเข้า
                if (!time || time.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Time slot is required.' });
                }

                // ตรวจสอบว่ามีช่วงเวลาที่มีค่าซ้ำกันอยู่แล้วหรือไม่
                const existingTimeSlot = await prisma.timeSlot.findUnique({
                    where: { time: time.trim() },
                });
                if (existingTimeSlot) {
                    return res.status(409).json({ error: 'Conflict', message: 'Time slot already exists.' });
                }

                // สร้างช่วงเวลาใหม่
                const newTimeSlot = await prisma.timeSlot.create({
                    data: { time: time.trim() },
                });
                res.status(201).json(newTimeSlot);
                break;
            } // ปิด block scope

            // PUT: อัปเดตช่วงเวลาที่มีอยู่
            case 'PUT': { // เพิ่ม block scope
                if (!id) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Time slot ID is required for update.' });
                }
                const { time: newTime } = req.body;
                if (!newTime || newTime.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'New time slot is required.' });
                }

                try {
                    // ตรวจสอบว่าค่าเวลาใหม่มีอยู่แล้วสำหรับช่วงเวลาอื่นหรือไม่
                    const existingTimeSlotWithTime = await prisma.timeSlot.findUnique({
                        where: { time: newTime.trim() },
                    });
                    if (existingTimeSlotWithTime && String(existingTimeSlotWithTime.id) !== String(id)) {
                        return res.status(409).json({ error: 'Conflict', message: 'Another time slot with this time already exists.' });
                    }

                    const updatedTimeSlot = await prisma.timeSlot.update({
                        where: { id: parseInt(id) }, // แปลง ID เป็น Integer
                        data: { time: newTime.trim() },
                    });
                    res.status(200).json(updatedTimeSlot);
                } catch (updateError) {
                    // จัดการกรณีที่ไม่พบ ID
                    if (updateError.code === 'P2025') { // รหัสข้อผิดพลาด Prisma สำหรับไม่พบบันทึก
                        return res.status(404).json({ error: 'Not Found', message: 'Time slot not found.' });
                    }
                    throw updateError; // ส่ง error อื่นๆ กลับไป
                }
                break;
            } // ปิด block scope

            // DELETE: ลบช่วงเวลาโดยใช้ ID
            case 'DELETE': { // เพิ่ม block scope
                if (!id) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Time slot ID is required for deletion.' });
                }
                try {
                    await prisma.timeSlot.delete({
                        where: { id: parseInt(id) }, // แปลง ID เป็น Integer
                    });
                    res.status(200).json({ message: 'Time slot deleted successfully.' });
                } catch (deleteError) {
                    // จัดการกรณีที่ไม่พบ ID
                    if (deleteError.code === 'P2025') { // รหัสข้อผิดพลาด Prisma สำหรับไม่พบบันทึก
                        return res.status(404).json({ error: 'Not Found', message: 'Time slot not found.' });
                    }
                    // จัดการการละเมิด foreign key constraint หากเกี่ยวข้อง (เช่น ช่วงเวลาเชื่อมโยงกับการจอง)
                    if (deleteError.code === 'P2003') { // รหัสข้อผิดพลาด Prisma สำหรับ foreign key constraint failed
                        return res.status(409).json({ error: 'Conflict', message: 'Cannot delete time slot because it is linked to existing bookings.' });
                    }
                    throw deleteError; // ส่ง error อื่นๆ กลับไป
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
        console.error('API Error (time-slots):', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred.' });
    } finally {
        await prisma.$disconnect();
    }
}
