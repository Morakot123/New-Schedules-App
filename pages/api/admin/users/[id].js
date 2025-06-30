// This handler is used for changing a user's role.
import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react'

const prisma = new PrismaClient()

export default async function handler(req, res) {
    // 1. Get the session and check for admin role.
    const session = await getSession({ req })
    if (!session || session.user.role !== 'admin') {
        // Return 403 Forbidden for unauthorized access.
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' })
    }

    // 2. Parse the user ID from the query parameter and validate it.
    const { id } = req.query
    const userId = parseInt(id)

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Bad Request', message: 'ID ผู้ใช้ไม่ถูกต้อง' })
    }

    // 3. Handle the HTTP method with enhanced error handling.
    try {
        if (req.method === 'PUT') {
            const { role } = req.body

            // Input validation: Ensure the role is one of the allowed values.
            if (!['admin', 'teacher'].includes(role)) {
                return res.status(400).json({ error: 'Bad Request', message: 'บทบาทไม่ถูกต้อง' })
            }

            // Prevent an admin from changing their own role.
            if (session.user.id === userId && role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden', message: 'ไม่สามารถเปลี่ยนบทบาทของตัวเองได้' });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { role },
            })

            return res.status(200).json(updatedUser)
        }

        // --- Handle unsupported methods ---
        res.setHeader('Allow', ['PUT'])
        return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })

    } catch (error) {
        console.error('API Error:', error)

        // Handle specific Prisma errors (e.g., record not found).
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Not Found', message: 'ไม่พบผู้ใช้ที่ต้องการอัปเดต' })
        }
        // Generic error response for any other unexpected errors.
        return res.status(500).json({ error: 'Internal Server Error', message: 'ไม่สามารถอัปเดตบทบาทผู้ใช้ได้' })
    } finally {
        // Ensure the database connection is closed after the request is handled.
        await prisma.$disconnect()
    }
}