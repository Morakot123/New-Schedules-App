import prisma from '../../../lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
    // 1. Get the session and check for admin role
    const session = await getSession({ req })
    if (!session || session.user.role !== 'admin') {
        // Return 403 Forbidden for unauthorized access
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' })
    }

    // 2. Parse the ID from the query, handle invalid ID
    const { id } = req.query
    const labId = parseInt(id)

    if (isNaN(labId)) {
        return res.status(400).json({ error: 'Bad Request', message: 'ID ห้องแลปไม่ถูกต้อง' })
    }

    // 3. Handle the DELETE method with enhanced error handling
    try {
        if (req.method === 'DELETE') {
            await prisma.lab.delete({
                where: { id: labId },
            })
            // Return a 200 OK with a success message for clarity
            return res.status(200).json({ message: 'ลบห้องแลปสำเร็จ', id: labId })
        }

        // --- Handle unsupported methods ---
        res.setHeader('Allow', ['DELETE'])
        return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })

    } catch (error) {
        console.error('API Error:', error)

        // Handle specific Prisma errors for better user feedback
        // P2025: Record to delete does not exist
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Not Found', message: 'ไม่พบห้องแลปที่ต้องการลบ' })
        }
        // P2003: Foreign key constraint failed (e.g., trying to delete a lab that is in a schedule)
        if (error.code === 'P2003') {
            return res.status(409).json({ error: 'Conflict', message: 'ไม่สามารถลบห้องแลปนี้ได้ เนื่องจากยังมีตารางเรียนเชื่อมโยงอยู่' })
        }

        // Generic error response for any other unexpected issues
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดขึ้นที่เซิร์ฟเวอร์' })
    } finally {
        // 4. Ensure the database connection is closed after the request is handled
        await prisma.$disconnect()
    }
}