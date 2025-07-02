// pages/api/register.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, password, role } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน: ชื่อ, อีเมล, รหัสผ่าน, และบทบาท' });
    }

    try {
        // ตรวจสอบว่าอีเมลนี้มีอยู่ในระบบแล้วหรือยัง
        const existingUser = await prisma.user.findUnique({
            where: { email: email.trim() },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'อีเมลนี้ถูกใช้ไปแล้ว' });
        }

        // แฮชรหัสผ่านก่อนบันทึกลงฐานข้อมูล
        const hashedPassword = await bcrypt.hash(password, 12); // ใช้ salt rounds 12

        let newUser;
        if (role === 'teacher') {
            // สำหรับบทบาท 'teacher', สร้าง User และ Teacher พร้อมกัน
            // แก้ไข: เปลี่ยนจาก `teachers` เป็น `teacher` ตามที่ Prisma แนะนำ
            newUser = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email: email.trim(),
                    password: hashedPassword,
                    role: 'teacher',
                    // นี่คือส่วนที่แก้ไข: ใช้ 'teacher' แทน 'teachers'
                    teacher: {
                        create: {
                            name: name.trim(), // ชื่อครูสามารถมาจากชื่อผู้ใช้ได้
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
        } else if (role === 'student') {
            // สำหรับบทบาท 'student', สร้าง User และ Student พร้อมกัน
            // แก้ไข: เปลี่ยนจาก `students` เป็น `student` หาก schema ของคุณเป็นเอกพจน์
            newUser = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email: email.trim(),
                    password: hashedPassword,
                    role: 'student',
                    // นี่คือส่วนที่แก้ไข: ใช้ 'student' แทน 'students'
                    student: { // สมมติว่าความสัมพันธ์ใน schema.prisma คือ 'student'
                        create: {
                            name: name.trim(), // ชื่อนักเรียนสามารถมาจากชื่อผู้ใช้ได้
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
        } else {
            // สำหรับบทบาทอื่นๆ หรือบทบาทเริ่มต้น, สร้างแค่ User
            newUser = await prisma.user.create({
                data: {
                    name: name.trim(),
                    email: email.trim(),
                    password: hashedPassword,
                    role: role,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });
        }

        // ส่งคืนข้อมูลผู้ใช้ที่สร้างสำเร็จ (ไม่รวมรหัสผ่าน)
        res.status(201).json({
            message: 'ลงทะเบียนสำเร็จ!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });

    } catch (error) {
        console.error('API Error (register):', error);
        // ตรวจสอบประเภทของ error เพื่อให้ข้อความที่เฉพาะเจาะจงมากขึ้น
        if (error.code === 'P2002') { // P2002 เป็นรหัสสำหรับ Unique constraint violation
            return res.status(409).json({ message: 'อีเมลนี้ถูกใช้ไปแล้ว' });
        }
        res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ขณะลงทะเบียน' });
    } finally {
        await prisma.$disconnect();
    }
}
