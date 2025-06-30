import prisma from '../../../lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
    // 1. Get the session and check for authorization (admin or teacher)
    const session = await getSession({ req })
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'teacher')) {
        // Return 403 Forbidden for unauthorized access
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' })
    }

    // 2. Parse the ID from the query, handle invalid ID
    const { id } = req.query
    const scheduleId = parseInt(id)

    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Bad Request', message: 'ID ตารางเรียนไม่ถูกต้อง' })
    }

    // 3. Handle the DELETE method with enhanced error handling
    try {
        if (req.method === 'DELETE') {
            await prisma.schedule.delete({
                where: { id: scheduleId },
            })
            // Return a 200 OK with a success message for clarity
            return res.status(200).json({ message: 'ลบตารางเรียนสำเร็จ', id: scheduleId })
        }

        // --- Handle unsupported methods ---
        res.setHeader('Allow', ['DELETE'])
        return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })

    } catch (error) {
        console.error('API Error:', error)

        // Handle specific Prisma errors for better user feedback
        // P2025: Record to delete does not exist
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Not Found', message: 'ไม่พบตารางเรียนที่ต้องการลบ' })
        }

        // Generic error response for any other unexpected issues
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดขึ้นที่เซิร์ฟเวอร์' })
    } finally {
        // 4. Ensure the database connection is closed after the request is handled
        await prisma.$disconnect()
    }
}