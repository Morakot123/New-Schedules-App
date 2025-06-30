import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react'; // For session authentication

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Authentication: Only allow authenticated admins to access this API
    const session = await getSession({ req });
    if (!session || session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden', message: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
    }

    // Extract ID from query parameters for specific booking operations (PUT, DELETE)
    const { id } = req.query;

    try {
        switch (req.method) {
            // GET: Fetch all bookings for admin view
            // Endpoint: /api/admin/bookings
            case 'GET':
                // Retrieve all bookings and include related information for display.
                // We're including the full objects of teacher, grade, room (Lab), and timeSlot
                // so the frontend can easily display their names/details.
                const bookings = await prisma.booking.findMany({
                    include: {
                        teacher: true,   // Include teacher object
                        grade: true,     // Include grade object
                        room: true,      // Include lab (room) object
                        timeSlot: true,  // Include timeSlot object
                    },
                    orderBy: [
                        { date: 'asc' },      // Order by date ascending
                        { timeSlot: { time: 'asc' } }, // Then by time slot's time ascending
                    ],
                });
                res.status(200).json(bookings);
                break;

            // PUT: Update a booking (e.g., change status from pending to approved/rejected)
            // Endpoint: /api/admin/bookings?id=<bookingId> or /api/admin/bookings/[id]
            case 'PUT':
                const updateId = id; // ID should come from the dynamic route [id]
                const { status, teacherId, gradeId, roomId, timeSlotId, date } = req.body; // Allow updating status, or other fields

                if (!updateId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Booking ID is required for update.' });
                }

                const updateData = {};
                if (status) updateData.status = status;
                if (teacherId) updateData.teacherId = parseInt(teacherId);
                if (gradeId) updateData.gradeId = parseInt(gradeId);
                if (roomId) updateData.roomId = parseInt(roomId);
                if (timeSlotId) updateData.timeSlotId = parseInt(timeSlotId);
                if (date) updateData.date = date;


                if (Object.keys(updateData).length === 0) {
                    return res.status(400).json({ error: 'Bad Request', message: 'ไม่มีข้อมูลให้อัปเดต' });
                }

                try {
                    const updatedBooking = await prisma.booking.update({
                        where: { id: parseInt(updateId) },
                        data: updateData,
                        include: {
                            teacher: true, grade: true, room: true, timeSlot: true
                        },
                    });
                    res.status(200).json(updatedBooking);
                } catch (updateError) {
                    console.error('Prisma update error:', updateError);
                    if (updateError.code === 'P2025') { // Record not found
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบการจองที่ต้องการอัปเดต' });
                    }
                    if (updateError.code === 'P2003') { // Foreign key constraint failed
                        return res.status(400).json({ error: 'Bad Request', message: 'ข้อมูลที่เชื่อมโยงไม่ถูกต้อง (เช่น Teacher ID, Grade ID, Room ID, Time Slot ID)' });
                    }
                    throw updateError; // Re-throw other errors
                }
                break;

            // DELETE: Remove a booking
            // Endpoint: /api/admin/bookings?id=<bookingId> or /api/admin/bookings/[id]
            case 'DELETE':
                const deleteId = id; // ID should come from the dynamic route [id]

                if (!deleteId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Booking ID is required for deletion.' });
                }

                try {
                    await prisma.booking.delete({
                        where: { id: parseInt(deleteId) },
                    });
                    res.status(200).json({ message: 'ลบการจองสำเร็จ' });
                } catch (deleteError) {
                    console.error('Prisma delete error:', deleteError);
                    if (deleteError.code === 'P2025') { // Record not found
                        return res.status(404).json({ error: 'Not Found', message: 'ไม่พบการจองที่ต้องการลบ' });
                    }
                    throw deleteError; // Re-throw other errors
                }
                break;

            // Handle other methods
            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                break;
        }
    } catch (error) {
        console.error('API Error (admin/bookings):', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
    } finally {
        await prisma.$disconnect();
    }
}
