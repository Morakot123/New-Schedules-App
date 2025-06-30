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
                // --- GET all students ---
                const students = await prisma.student.findMany({
                    // Include the related class group for display on the frontend
                    include: { classGroup: true },
                    // You might want to add orderBy or pagination here for larger datasets
                    orderBy: { name: 'asc' }, // Sort students by name
                })
                return res.status(200).json(students)

            case 'POST':
                // --- CREATE a new student ---
                const { name, classGroupId } = req.body

                // Input validation: Ensure the required 'name' field is present
                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'กรุณาใส่ชื่อนักเรียน' })
                }

                // Prepare data for creation, handling the optional classGroupId
                const creationData = { name: name.trim() };
                if (classGroupId) {
                    const parsedClassGroupId = parseInt(classGroupId);
                    if (isNaN(parsedClassGroupId)) {
                        return res.status(400).json({ error: 'Bad Request', message: 'ID กลุ่มเรียนไม่ถูกต้อง' });
                    }
                    // Connect related records using their IDs
                    creationData.classGroup = { connect: { id: parsedClassGroupId } };
                }

                const newStudent = await prisma.student.create({
                    data: creationData,
                    // Include relations in the response for immediate frontend update
                    include: { classGroup: true },
                })
                // Return 201 Created for successful creation
                return res.status(201).json(newStudent)

            default:
                // --- Handle unsupported HTTP methods ---
                res.setHeader('Allow', ['GET', 'POST'])
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
        }
    } catch (error) {
        console.error('API Error (students):', error) // Log the full error for debugging

        // Handle specific Prisma errors, e.g., if a connected classGroupId doesn't exist (P2003 Foreign key constraint failed)
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Bad Request', message: 'ไม่พบกลุ่มเรียนที่ระบุ' })
        }
        // Generic error response for any other unexpected errors
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // Ensure the database connection is closed after the request is handled
        await prisma.$disconnect()
    }
}