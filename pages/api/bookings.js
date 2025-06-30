// This is a mock database. In a real app, you would use a database like MongoDB or PostgreSQL.
let bookings = [
    { id: 'b1', teacher: 'ครูสมศรี', grade: 'ม.1', date: '2025-06-30', timeSlot: '10:00-11:00', roomId: 'R1', status: 'approved' },
    { id: 'b2', teacher: 'ครูสมชาย', grade: 'ม.2', date: '2025-07-01', timeSlot: '11:00-12:00', roomId: 'R1', status: 'approved' },
    { id: 'b3', teacher: 'ครูสุดา', grade: 'ม.3', date: '2025-07-02', timeSlot: '09:00-10:00', roomId: 'R2', status: 'approved' },
    { id: 'b4', teacher: 'ครูเอก', grade: 'ม.4', date: '2025-07-02', timeSlot: '14:00-15:00', roomId: 'R1', status: 'pending' }, // Example of pending booking
];

export default function handler(req, res) {
    // GET: Return all bookings
    if (req.method === 'GET') {
        res.status(200).json(bookings);
    }

    // POST: Create a new booking
    else if (req.method === 'POST') {
        const { teacher, grade, date, timeSlot, roomId, status } = req.body;
        // Simple validation
        if (!teacher || !grade || !date || !timeSlot || !roomId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newBooking = {
            id: `b${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID
            teacher,
            grade,
            date,
            timeSlot,
            roomId, // NEW: Save room ID
            status: status || 'pending', // NEW: Set status, default to pending
        };
        bookings.push(newBooking);
        res.status(201).json(newBooking);
    }

    // DELETE: Remove a booking
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        const initialLength = bookings.length;
        bookings = bookings.filter(b => b.id !== id);
        if (bookings.length < initialLength) {
            res.status(200).json({ message: 'Booking deleted successfully' });
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    }

    // PUT: Update a booking (e.g., status)
    else if (req.method === 'PUT') {
        const { id } = req.query;
        const { status } = req.body;
        const bookingIndex = bookings.findIndex(b => b.id === id);

        if (bookingIndex > -1) {
            bookings[bookingIndex].status = status;
            res.status(200).json(bookings[bookingIndex]);
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    }

    // Handle other methods
    else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}