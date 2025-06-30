import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react'

const prisma = new PrismaClient()

export default async function handler(req, res) {
    // 1. Get the session and check for admin role
    const session = await getSession({ req })
    if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' })
    }

    // 2. Parse the ID from the query, handle invalid ID
    const { id } = req.query
    const scheduleId = parseInt(id)

    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: 'Bad Request', message: 'ID ตารางเรียนไม่ถูกต้อง' })
    }

    // 3. Handle GET, PUT, and DELETE methods with enhanced error handling
    try {
        switch (req.method) {
            case 'GET':
                // --- GET a specific schedule ---
                const schedule = await prisma.schedule.findUnique({
                    where: { id: scheduleId },
                    // Include relations for frontend display
                    include: {
                        teacher: true,
                        lab: true,
                        classGroup: true,
                    },
                })
                if (!schedule) {
                    return res.status(404).json({ error: 'Not Found', message: 'ไม่พบตารางเรียน' })
                }
                return res.status(200).json(schedule)

            case 'PUT':
                // --- UPDATE a schedule ---
                const { subject, time, teacherId, labId, classGroupId } = req.body

                // Validate request body
                if (!subject || !time || !teacherId || !labId || !classGroupId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'ข้อมูลไม่ครบถ้วน' })
                }

                const updatedSchedule = await prisma.schedule.update({
                    where: { id: scheduleId },
                    data: {
                        subject,
                        time,
                        teacher: { connect: { id: parseInt(teacherId) } },
                        lab: { connect: { id: parseInt(labId) } },
                        classGroup: { connect: { id: parseInt(classGroupId) } },
                    },
                    include: { // Include relations for immediate frontend update
                        teacher: true,
                        lab: true,
                        classGroup: true,
                    },
                })
                return res.status(200).json(updatedSchedule)

            case 'DELETE':
                // --- DELETE a schedule ---
                await prisma.schedule.delete({
                    where: { id: scheduleId },
                })
                return res.status(200).json({ message: 'ลบตารางเรียนสำเร็จ', id: scheduleId })

            default:
                // --- Handle unsupported methods ---
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
        }
    } catch (error) {
        console.error('API Error:', error)
        // Handle specific Prisma errors (e.g., record not found)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Not Found', message: 'ไม่พบรายการที่จะดำเนินการ' })
        }
        // Generic error response
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดขึ้นที่เซิร์ฟเวอร์' })
    } finally {
        await prisma.$disconnect()
    }
}