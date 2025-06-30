import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react' // Import getSession for server-side authentication

const prisma = new PrismaClient()

export default async function handler(req, res) {
    // 1. Get the session for authorization checks
    const session = await getSession({ req })

    try {
        switch (req.method) {
            case 'GET':
                // --- Authorization for GET: Allow all authenticated users ---
                if (!session) {
                    return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' });
                }

                const schedules = await prisma.schedule.findMany({
                    include: {
                        teacher: true,    // Include teacher details
                        lab: true,        // Include lab details
                        classGroup: true, // Include class group details
                    },
                    orderBy: { time: 'asc' }, // Order by time for a structured display
                })
                return res.status(200).json(schedules)

            case 'POST':
                // --- Authorization for POST: Allow only admin or teacher roles ---
                if (!session || (session.user.role !== 'admin' && session.user.role !== 'teacher')) {
                    return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์สร้างตารางเรียน' });
                }

                const { subject, time, teacherId, labId, classGroupId } = req.body

                // 2. Input Validation for POST request
                if (!subject || subject.trim() === '' ||
                    !time || time.trim() === '' ||
                    !teacherId || !labId || !classGroupId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
                }

                // Safely parse IDs and validate
                const parsedTeacherId = parseInt(teacherId)
                const parsedLabId = parseInt(labId)
                const parsedClassGroupId = parseInt(classGroupId)

                if (isNaN(parsedTeacherId) || isNaN(parsedLabId) || isNaN(parsedClassGroupId)) {
                    return res.status(400).json({ error: 'Bad Request', message: 'ID ครูผู้สอน ห้องแลป หรือกลุ่มเรียนไม่ถูกต้อง' })
                }

                const createdSchedule = await prisma.schedule.create({
                    data: {
                        subject: subject.trim(),
                        time: time.trim(),
                        // Connect related records using their IDs for proper foreign key linkage
                        teacher: { connect: { id: parsedTeacherId } },
                        lab: { connect: { id: parsedLabId } },
                        classGroup: { connect: { id: parsedClassGroupId } },
                    },
                    // Include relations in the response to immediately provide full data to the frontend
                    include: { teacher: true, lab: true, classGroup: true },
                })
                // Return 201 Created for successful resource creation
                return res.status(201).json(createdSchedule)

            default:
                // --- Handle unsupported HTTP methods ---
                res.setHeader('Allow', ['GET', 'POST'])
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
        }
    } catch (error) {
        console.error('API Error (schedules):', error) // Log the full error for debugging on the server

        // Handle specific Prisma errors for better user feedback
        // P2003: Foreign key constraint failed (e.g., if a connected ID doesn't exist)
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Bad Request', message: 'ไม่พบครูผู้สอน ห้องแลป หรือกลุ่มเรียนที่ระบุ' })
        }
        // Generic error response for any other unexpected server issues
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // 3. Ensure the database connection is closed after the request is handled
        await prisma.$disconnect()
    }
}