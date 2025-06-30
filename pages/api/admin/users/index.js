// This handler is used to show all users with 'admin' and 'teacher' roles.
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

    try {
        switch (req.method) {
            case 'GET':
                // --- GET all users with 'admin' or 'teacher' roles ---
                const users = await prisma.user.findMany({
                    where: {
                        role: { in: ['admin', 'teacher'] },
                    },
                    select: {
                        // Explicitly select only the necessary fields to avoid exposing sensitive data like `password`.
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                    orderBy: {
                        id: 'asc', // Sort by ID for consistent ordering
                    },
                })
                return res.status(200).json(users)

            default:
                // --- Handle unsupported HTTP methods ---
                res.setHeader('Allow', ['GET'])
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
        }
    } catch (error) {
        console.error('API Error:', error) // Log the full error for debugging
        // Return a generic 500 error for any unexpected server issues.
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // 2. Ensure the database connection is closed after the request is handled.
        await prisma.$disconnect()
    }
}