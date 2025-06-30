import { PrismaClient } from '@prisma/client'
import { getSession } from 'next-auth/react'
import bcrypt from 'bcryptjs'

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
                // --- GET all users with the 'teacher' role ---
                const teachers = await prisma.user.findMany({
                    where: { role: 'teacher' },
                    select: {
                        // Explicitly select only necessary public fields
                        id: true,
                        name: true,
                        email: true,
                    },
                    orderBy: {
                        name: 'asc' // Sort by name for a better user experience
                    }
                })
                return res.status(200).json(teachers)

            case 'POST':
                // --- CREATE a new user with the 'teacher' role ---
                const { name, email, password } = req.body

                // 2. Input Validation: Ensure all required fields are present and valid
                if (!name || !email || !password || name.trim() === '' || email.trim() === '' || password.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' })
                }

                // Validate email format (optional but recommended)
                if (!/\S+@\S+\.\S+/.test(email)) {
                    return res.status(400).json({ error: 'Bad Request', message: 'รูปแบบอีเมลไม่ถูกต้อง' });
                }

                // Check if a user with the same email already exists
                const existingUser = await prisma.user.findUnique({ where: { email } })
                if (existingUser) {
                    return res.status(409).json({ error: 'Conflict', message: 'อีเมลนี้ถูกใช้แล้ว' })
                }

                // Hash the password securely
                const hashedPassword = await bcrypt.hash(password, 12) // Use a stronger salt round (e.g., 12)

                const newUser = await prisma.user.create({
                    data: {
                        name: name.trim(),
                        email: email.trim(),
                        password: hashedPassword,
                        role: 'teacher',
                        // Connect to the `teachers` model if your schema requires it
                        // This creates a related `Teacher` record for the `User`
                        teachers: {
                            create: { name: name.trim() }
                        }
                    },
                    select: {
                        // Return only safe data after creation
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                })

                // Return 201 Created for a successful creation
                return res.status(201).json(newUser)

            default:
                // --- Handle unsupported HTTP methods ---
                res.setHeader('Allow', ['GET', 'POST'])
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` })
        }
    } catch (error) {
        console.error('API Error (teachers):', error) // Log the full error for debugging
        // Return a generic 500 error for any unexpected server issues
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
    } finally {
        // 3. Ensure the database connection is closed after the request is handled
        await prisma.$disconnect()
    }
}