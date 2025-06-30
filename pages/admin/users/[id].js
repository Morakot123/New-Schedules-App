import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
    // 1. Enforce HTTP Method
    if (req.method !== 'PUT') {
        // Return a 405 Method Not Allowed if not a PUT request
        res.setHeader('Allow', ['PUT'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    // 2. Session & Authorization Check
    const session = await getServerSession(req, res, authOptions)
    if (!session || session.user.role !== 'admin') {
        // Use a 401 Unauthorized for missing session, 403 Forbidden for insufficient role
        return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง' })
    }

    // 3. Input Validation
    const userId = parseInt(req.query.id)
    const { role } = req.body

    // Check if userId is a valid number and role is a valid value
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'รหัสผู้ใช้ไม่ถูกต้อง' })
    }

    if (!role || !['admin', 'teacher', 'student'].includes(role)) {
        return res.status(400).json({ message: 'บทบาทไม่ถูกต้อง' })
    }

    try {
        // 4. Prevent a user from changing their own role
        if (session.user.id === userId) {
            return res.status(403).json({ message: 'ไม่สามารถเปลี่ยนบทบาทของตัวเองได้' })
        }

        // 5. Database Operation
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
        })

        // 6. Success Response
        return res.status(200).json(updatedUser)
    } catch (error) {
        // 7. Error Handling
        if (error.code === 'P2025') {
            // P2025 is Prisma's error code for a record not found
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ต้องการอัปเดต' })
        }
        console.error('Failed to update user role:', error)
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // Ensure the database connection is closed
        await prisma.$disconnect()
    }
}