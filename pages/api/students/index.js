import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import bcrypt from 'bcryptjs'; // Required for hashing passwords

const prisma = new PrismaClient();

// Helper function to generate a random password for new user accounts
const generateRandomPassword = (length = 12) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export default async function handler(req, res) {
    // 1. Get the session and check for admin role
    const session = await getSession({ req });
    if (!session || session.user.role !== 'admin') {
        // Return 403 Forbidden for unauthorized access
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง' });
    }

    // Extract ID from query parameters for dynamic routes like /api/admin/students/[id]
    const { id } = req.query;

    try {
        switch (req.method) {
            case 'GET':
                // --- GET all students ---
                const students = await prisma.student.findMany({
                    // Include the related user (for email) and class group for display on the frontend
                    include: {
                        user: {
                            select: {
                                email: true, // Select email from the associated User
                            },
                        },
                        classGroup: true, // Include the entire classGroup object
                    },
                    orderBy: {
                        name: 'asc', // Sort students by name
                    },
                });
                return res.status(200).json(students);

            case 'POST':
                // --- CREATE a new student and associated User ---
                const { name, classGroupId } = req.body; // classGroupId is now optional

                // Input validation: Ensure the required 'name' field is present
                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'กรุณาใส่ชื่อนักเรียน' });
                }

                // Generate a unique email and a random password for the new student's user account
                const generatedEmail = `${name.trim().toLowerCase().replace(/\s/g, '.')}-${Date.now()}@student.example.com`;
                const generatedPassword = generateRandomPassword();
                const hashedPassword = await bcrypt.hash(generatedPassword, 12);

                try {
                    // Use a Prisma transaction to ensure both User and Student are created successfully
                    // or rolled back if any part fails.
                    const newStudentWithUser = await prisma.$transaction(async (tx) => {
                        // Create the new User first
                        const newUser = await tx.user.create({
                            data: {
                                name: name.trim(),
                                email: generatedEmail,
                                password: hashedPassword,
                                role: 'student', // Assign 'student' role
                            },
                        });

                        // Prepare data for Student creation, linking to the new User
                        const studentData = {
                            name: name.trim(),
                            userId: newUser.id, // Link to the newly created User
                        };

                        // If classGroupId is provided, connect to the ClassGroup
                        if (classGroupId && classGroupId.trim() !== '') {
                            // Ensure classGroupId is a string (UUID)
                            studentData.classGroup = { connect: { id: classGroupId.trim() } };
                        }

                        // Create the Student record
                        const newStudent = await tx.student.create({
                            data: studentData,
                            include: { classGroup: true, user: { select: { email: true } } }, // Include relations in response
                        });
                        return newStudent;
                    });

                    // Return 201 Created for successful creation
                    return res.status(201).json(newStudentWithUser);
                } catch (transactionError) {
                    // Handle specific Prisma errors during transaction
                    if (transactionError.code === 'P2003' && transactionError.meta?.field_name === 'classGroupId') {
                        return res.status(400).json({ error: 'Bad Request', message: 'ไม่พบกลุ่มเรียนที่ระบุ' });
                    }
                    if (transactionError.code === 'P2002' && transactionError.meta?.target?.includes('email')) {
                        return res.status(409).json({ error: 'Conflict', message: 'อีเมลนี้ถูกใช้งานแล้ว (ระบบสร้างอีเมลอัตโนมัติซ้ำ)' });
                    }
                    throw transactionError; // Re-throw other errors for generic handling
                }

            case 'PUT':
                // --- UPDATE an existing student ---
                const updateId = id; // ID comes from the dynamic route [id]
                const { name: updateName, classGroupId: updateClassGroupId } = req.body;

                // Validate ID
                if (!updateId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Student ID is required for update.' });
                }

                // Prepare data for update
                const updateData = {};
                if (updateName && updateName.trim() !== '') {
                    updateData.name = updateName.trim();
                }

                // Handle classGroupId update: connect, disconnect, or null
                if (updateClassGroupId !== undefined) {
                    if (updateClassGroupId === null || updateClassGroupId.trim() === '') {
                        updateData.classGroup = { disconnect: true }; // Disconnect from current class group
                        updateData.classGroupId = null; // Ensure the foreign key is set to null
                    } else {
                        updateData.classGroup = { connect: { id: updateClassGroupId.trim() } };
                    }
                }

                // Ensure there's something to update
                if (Object.keys(updateData).length === 0) {
                    return res.status(400).json({ error: 'Bad Request', message: 'ไม่มีข้อมูลให้อัปเดต' });
                }

                try {
                    const updatedStudent = await prisma.student.update({
                        where: { id: String(updateId) },
                        data: updateData,
                        include: { classGroup: true, user: { select: { email: true } } }, // Include relations in response
                    });
                    return res.status(200).json(updatedStudent);
                } catch (updateError) {
                    if (updateError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบนักเรียนที่ต้องการอัปเดต' });
                    }
                    if (updateError.code === 'P2003' && updateError.meta?.field_name === 'classGroupId') {
                        return res.status(400).json({ error: 'Bad Request', message: 'ไม่พบกลุ่มเรียนที่ระบุสำหรับการเชื่อมโยง' });
                    }
                    throw updateError;
                }

            case 'DELETE':
                // --- DELETE a student and associated User ---
                const deleteId = id; // ID comes from the dynamic route [id]

                // Validate ID
                if (!deleteId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Student ID is required for deletion.' });
                }

                try {
                    // Find the student to get their associated userId
                    const studentToDelete = await prisma.student.findUnique({
                        where: { id: String(deleteId) },
                        select: { userId: true }, // Only need the userId
                    });

                    if (!studentToDelete) {
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบนักเรียนที่ต้องการลบ' });
                    }

                    // Delete the User record. Due to `onDelete: Cascade` in schema.prisma
                    // for the Student model's `userId` relation, the associated Student
                    // record will be automatically deleted by the database.
                    await prisma.user.delete({
                        where: { id: studentToDelete.userId },
                    });

                    return res.status(200).json({ message: 'ลบนักเรียนและบัญชีผู้ใช้ที่เกี่ยวข้องสำเร็จ' });
                } catch (deleteError) {
                    if (deleteError.code === 'P2025') { // User/Student not found
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบนักเรียนหรือผู้ใช้ที่ต้องการลบ' });
                    }
                    throw deleteError;
                }

            default:
                // --- Handle unsupported HTTP methods ---
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: 'Method Not Allowed', message: `Method ${req.method} is not allowed` });
        }
    } catch (error) {
        console.error('API Error (admin/students):', error); // Log the full error for debugging

        // Generic error response for any other unexpected errors
        return res.status(500).json({ error: 'Internal Server Error', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    } finally {
        // Ensure the database connection is closed after the request is handled
        await prisma.$disconnect();
    }
}
