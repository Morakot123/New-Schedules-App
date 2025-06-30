import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient(); // สร้างอินสแตนซ์ใหม่ของ PrismaClient

// ฟังก์ชันสำหรับสร้างรหัสผ่านสุ่ม
const generateRandomPassword = (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        switch (req.method) {
            // GET: ดึงครูทั้งหมดจากฐานข้อมูล
            case 'GET': { // เพิ่ม block scope
                const teachers = await prisma.teacher.findMany({
                    include: {
                        user: { // รวมโมเดล User ที่เกี่ยวข้องเพื่อดึงอีเมล
                            select: {
                                email: true,
                            },
                        },
                    },
                    orderBy: {
                        name: 'asc', // เรียงครูตามชื่อตัวอักษร
                    },
                });
                res.status(200).json(teachers);
                break;
            } // ปิด block scope

            // POST: สร้างครูใหม่ (รวมถึงการสร้าง User ใหม่ด้วยข้อมูลเริ่มต้น)
            case 'POST': { // เพิ่ม block scope
                const { name } = req.body;

                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Teacher name is required.' });
                }

                // สร้างอีเมลและรหัสผ่านแบบสุ่ม
                const generatedEmail = `${name.trim().toLowerCase().replace(/\s/g, '.')}-${Date.now()}@example.com`;
                const generatedPassword = generateRandomPassword(12);
                const hashedPassword = await bcrypt.hash(generatedPassword, 12);

                // ตรวจสอบว่าอีเมลที่สร้างขึ้นมีอยู่แล้วหรือไม่
                const existingUser = await prisma.user.findUnique({ where: { email: generatedEmail } });
                if (existingUser) {
                    return res.status(409).json({ error: 'Conflict', message: 'Generated email already in use. Please try again.' });
                }

                const newTeacherEntry = await prisma.$transaction(async (prisma) => {
                    // สร้าง User ก่อน
                    const newUser = await prisma.user.create({
                        data: {
                            name: name.trim(),
                            email: generatedEmail,
                            password: hashedPassword,
                            role: 'teacher', // กำหนดบทบาทเป็น 'teacher'
                        },
                    });

                    // จากนั้นสร้าง Teacher โดยเชื่อมโยงกับ User ที่สร้างขึ้น
                    const newTeacher = await prisma.teacher.create({
                        data: {
                            userId: newUser.id, // เชื่อมโยงกับ ID ของ User ที่สร้างขึ้น
                            name: name.trim(), // ใช้ชื่อเดียวกับ User
                        },
                    });
                    // คืนค่าอ็อบเจกต์ครูที่สร้างขึ้นพร้อมอีเมลของ User
                    return { ...newTeacher, user: { email: newUser.email } };
                });

                res.status(201).json(newTeacherEntry);
                break;
            } // ปิด block scope

            // PUT: อัปเดตครูที่มีอยู่
            case 'PUT': { // เพิ่ม block scope
                const updateId = id || req.body.id;
                const { name: updatedName } = req.body;

                if (!updateId || !updatedName || updatedName.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Teacher ID and name are required for update.' });
                }

                try {
                    // ตรวจสอบว่าชื่อใหม่มีอยู่แล้วสำหรับครูคนอื่นหรือไม่
                    const existingTeacherWithName = await prisma.teacher.findUnique({
                        where: { name: updatedName.trim() },
                    });
                    if (existingTeacherWithName && String(existingTeacherWithName.id) !== String(updateId)) {
                        return res.status(409).json({ error: 'Conflict', message: 'Another teacher with this name already exists.' });
                    }

                    const updatedTeacher = await prisma.teacher.update({
                        where: { id: parseInt(updateId) },
                        data: { name: updatedName.trim() },
                        include: {
                            user: {
                                select: {
                                    email: true
                                }
                            }
                        }
                    });
                    res.status(200).json(updatedTeacher);
                } catch (updateError) {
                    if (updateError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'Teacher not found.' });
                    }
                    throw updateError;
                }
                break;
            } // ปิด block scope

            // DELETE: ลบครู
            case 'DELETE': { // เพิ่ม block scope
                const deleteId = id;

                if (!deleteId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Teacher ID is required for deletion.' });
                }

                // ดึงข้อมูลครูเพื่อหา userId ที่เกี่ยวข้อง
                const teacherToDelete = await prisma.teacher.findUnique({
                    where: { id: parseInt(deleteId) },
                });

                if (!teacherToDelete) {
                    return res.status(404).json({ error: 'Not Found', message: 'Teacher not found.' });
                }

                // ลบ User ที่เกี่ยวข้องด้วย
                // เนื่องจากมีความสัมพันธ์แบบ Cascade, การลบ User จะลบ Teacher, Account, Session, Schedule ที่เกี่ยวข้องด้วย
                await prisma.user.delete({
                    where: { id: teacherToDelete.userId },
                });

                res.status(200).json({ message: 'Teacher and associated user deleted successfully.' });
                break;
            } // ปิด block scope

            default: { // เพิ่ม block scope
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                break;
            } // ปิด block scope
        }
    } catch (error) {
        console.error('API Error (teachers):', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Conflict', message: 'Teacher with this name or email might already exist.' });
        }
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred.' });
    } finally {
        await prisma.$disconnect();
    }
}
