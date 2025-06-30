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
    const studentId = parseInt(id)

    if (isNaN(studentId)) {
        return res.status(400).json({ error: 'Bad Request', message: 'ID นักเรียนไม่ถูกต้อง' })
    }

    // 3. Handle GET, PUT, and DELETE methods with enhanced error handling
    try {
        switch (req.method) {
            case 'GET':
                // --- GET a specific student ---
                const student = await prisma.student.findUnique({
                    where: { id: studentId },
                    // Include the related class group for display purposes
                    include: { classGroup: true },
                })
                if (!student) {
                    return res.status(404).json({ error: 'Not Found', message: 'ไม่พบนักเรียน' })
                }
                return res.status(200).json(student)

            case 'PUT':
                // --- UPDATE a student ---
                const { name, classGroupId } = req.body

                // Validate request body
                if (!name) {
                    return res.status(400).json({ error: 'Bad Request', message: 'กรุณาใส่ชื่อนักเรียน' })
                }

                // Prepare data for update, handling optional classGroupId
                const updateData = { name };
                if (classGroupId) {
                    const parsedClassGroupId = parseInt(classGroupId);
                    if (isNaN(parsedClassGroupId)) {
                        return res.status(400).json({ error: 'Bad Request', message: 'ID กลุ่มเรียนไม่ถูกต้อง' });
                    }
                    updateData.classGroup = { connect: { id: parsedClassGroupId } };
                } else {
                    // If classGroupId is null/undefined, disconnect the relation
                    updateData.classGroup = { disconnect: true };
                }

                const updatedStudent = await prisma.student.update({
                    where: { id: studentId },
                    data: updateData,
                    include: { classGroup: true }, // Include relation in the response
                })
                return res.status(200).json(updatedStudent)

            case 'DELETE':
                // --- DELETE a student ---
                await prisma.student.delete({
                    where: { id: studentId },
                })
                return res.status(200).json({ message: 'ลบนักเรียนสำเร็จ', id: studentId })

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