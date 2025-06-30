import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs' // ใช้ bcryptjs ให้ตรงกับ seed และ NextAuth configuration

const prisma = new PrismaClient()

export default async function handler(req, res) {
    // 1. ตรวจสอบว่า HTTP method เป็น POST เท่านั้น
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
    }

    try {
        const { name, email, password, role } = req.body

        // 2. การตรวจสอบข้อมูลขาเข้า (Input Validation)
        if (!name || name.trim() === '' ||
            !email || email.trim() === '' ||
            !password || password.trim() === '') {
            return res.status(400).json({ error: 'Bad Request', message: 'กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน' })
        }

        // ตรวจสอบรูปแบบอีเมล
        if (!/\S+@\S+\.\S+/.test(email.trim())) {
            return res.status(400).json({ error: 'Bad Request', message: 'รูปแบบอีเมลไม่ถูกต้อง' });
        }

        // ตรวจสอบความยาวรหัสผ่านขั้นต่ำ
        if (password.length < 6) {
            return res.status(400).json({ error: 'Bad Request', message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
        }

        // 3. ยืนยันว่า role ที่ส่งมาคือ 'teacher' สำหรับ endpoint นี้
        if (role !== 'teacher') {
            return res.status(400).json({ error: 'Bad Request', message: 'การลงทะเบียนนี้สำหรับบทบาทครูผู้สอนเท่านั้น' })
        }

        // 4. ตรวจสอบว่าอีเมลนี้ถูกใช้งานแล้วหรือไม่
        const existingUser = await prisma.user.findUnique({ where: { email: email.trim() } })
        if (existingUser) {
            return res.status(409).json({ error: 'Conflict', message: 'อีเมลนี้ถูกใช้งานแล้ว' })
        }

        // 5. Hash รหัสผ่านก่อนบันทึกลงฐานข้อมูล
        // ใช้ 12 rounds เพื่อความปลอดภัยที่ดีขึ้น
        const hashedPassword = await bcrypt.hash(password, 12)

        // 6. สร้างผู้ใช้ใหม่ในฐานข้อมูลพร้อมเชื่อมโยงกับตาราง Teacher
        const newUser = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim(),
                password: hashedPassword,
                role: 'teacher', // กำหนดบทบาทเป็น 'teacher' เสมอสำหรับ endpoint นี้
                teachers: { // สร้าง record ในตาราง Teacher และเชื่อมโยงกับ User นี้
                    create: { name: name.trim() }
                }
            },
            // เลือกข้อมูลที่จะส่งกลับ เพื่อไม่ให้ส่งรหัสผ่านที่ hash แล้วออกไป
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        })

        // 7. ส่งสถานะ 201 Created เมื่อสร้างสำเร็จ
        return res.status(201).json({ message: 'สมัครเป็นครูผู้สอนเรียบร้อยแล้ว', user: newUser })

    } catch (error) {
        // 8. การจัดการข้อผิดพลาด (Error Handling)
        console.error('API Error (register teacher):', error)
        // ส่งข้อผิดพลาด 500 Internal Server Error สำหรับข้อผิดพลาดที่ไม่คาดคิด
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // 9. ปิดการเชื่อมต่อฐานข้อมูล
        await prisma.$disconnect()
    }
}