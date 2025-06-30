import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react'

const prisma = new PrismaClient()

export default async function handler(req, res) {
    // 1. Get the session and check for admin role
    const session = await getSession({ req })
    if (!session || session.user.role !== 'admin') {
        // Return 403 Forbidden for unauthorized access
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' })
    }

    try {
        switch (req.method) {
            case 'GET':
                // --- GET all schedules ---
                const schedules = await prisma.schedule.findMany({
                    // Include related data for display on the frontend
                    include: { teacher: true, lab: true, classGroup: true },
                    // You might want to add orderBy or pagination here for larger datasets
                })
                return res.status(200).json(schedules)

            case 'POST':
                // --- CREATE a new schedule ---
                const { subject, time, teacherId, labId, classGroupId } = req.body

                // Input validation: Ensure all required fields are present
                if (!subject || !time || !teacherId || !labId || !classGroupId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'ข้อมูลไม่ครบถ้วน' })
                }

                // Convert IDs to integers
                const parsedTeacherId = parseInt(teacherId)
                const parsedLabId = parseInt(labId)
                const parsedClassGroupId = parseInt(classGroupId)

                // Validate parsed IDs
                if (isNaN(parsedTeacherId) || isNaN(parsedLabId) || isNaN(parsedClassGroupId)) {
                    return res.status(400).json({ error: 'Bad Request', message: 'ID ที่เชื่อมโยงไม่ถูกต้อง' })
                }

                const newSchedule = await prisma.schedule.create({
                    data: {
                        subject,
                        time,
                        // Connect related records using their IDs
                        teacher: { connect: { id: parsedTeacherId } },
                        lab: { connect: { id: parsedLabId } },
                        classGroup: { connect: { id: parsedClassGroupId } },
                    },
                    // Include relations in the response for immediate frontend update
                    include: { teacher: true, lab: true, classGroup: true },
                })
                // Return 201 Created for successful creation
                return res.status(201).json(newSchedule)

            default:
                // --- Handle unsupported HTTP methods ---
                res.setHeader('Allow', ['GET', 'POST'])
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
        }
    } catch (error) {
        console.error('API Error (schedules):', error) // Log the full error for debugging

        // Handle specific Prisma errors, e.g., if a connected ID doesn't exist (P2003 Foreign key constraint failed)
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Bad Request', message: 'ไม่พบครู ห้องแลป หรือกลุ่มเรียนที่ระบุ' })
        }
        // Generic error response for any other unexpected errors
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // Ensure the database connection is closed after the request is handled
        await prisma.$disconnect()
    }
}