import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react' // Import getSession for server-side authentication

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
                // --- GET all class groups ---
                const classes = await prisma.classGroup.findMany({
                    orderBy: { name: 'asc' }, // Order by name for consistency and better display
                })
                return res.status(200).json(classes)

            case 'POST':
                // --- CREATE a new class group ---
                const { name } = req.body

                // Input validation: Ensure 'name' is provided and not empty
                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'กรุณาระบุชื่อชั้นเรียน' })
                }

                // Check if a class group with the same name already exists
                const existingClassGroup = await prisma.classGroup.findUnique({
                    where: { name: name.trim() },
                });

                if (existingClassGroup) {
                    return res.status(409).json({ error: 'Conflict', message: 'ชื่อชั้นเรียนนี้มีอยู่แล้ว' });
                }

                const createdClassGroup = await prisma.classGroup.create({
                    data: { name: name.trim() }, // Trim whitespace from name
                })
                // Return 201 Created for successful resource creation
                return res.status(201).json(createdClassGroup)

            default:
                // --- Handle unsupported HTTP methods ---
                res.setHeader('Allow', ['GET', 'POST'])
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
        }
    } catch (error) {
        console.error('API Error (class-groups):', error) // Log the full error for debugging
        // Generic error response for any unexpected server issues
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // Ensure the database connection is closed after the request is handled
        await prisma.$disconnect()
    }
}