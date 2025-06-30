import prisma from '../../../lib/prisma'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
    // 1. Get the session and perform authorization check
    const session = await getSession({ req })

    // Ensure the user is authenticated and has the 'teacher' role
    if (!session || session.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' })
    }

    // 2. Safely retrieve the teacherId from the session
    // This assumes `teacherId` is included in the JWT payload from the NextAuth callback.
    const teacherId = session.user.teacherId
    if (!teacherId) {
        // If the teacherId is missing from the session, something is wrong with the user's account.
        console.error(`User with email ${session.user.email} is authenticated as a teacher but is missing teacherId in session.`)
        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบข้อมูลครูผู้สอนที่เชื่อมโยงกับบัญชีของคุณ' })
    }

    // 3. Handle the GET method with a comprehensive try-catch block
    if (req.method === 'GET') {
        try {
            const schedules = await prisma.schedule.findMany({
                where: { teacherId: teacherId },
                include: {
                    lab: true,
                    classGroup: true,
                },
                orderBy: { time: 'asc' }, // Ensure schedules are sorted chronologically
            })

            return res.status(200).json(schedules)
        } catch (err) {
            // 4. Log the error and return a consistent server error response
            console.error('API Error (teacher schedules):', err)
            return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
        } finally {
            // 5. Ensure the database connection is closed after the request is handled
            await prisma.$disconnect()
        }
    }

    // 6. Handle unsupported methods
    res.setHeader('Allow', ['GET'])
    res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
}