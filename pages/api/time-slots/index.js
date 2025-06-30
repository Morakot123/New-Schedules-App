// This is a mock database for time slots.
let timeSlots = [
    { id: 'TS1', name: 'คาบ 1', time: '08:30 - 09:20' },
    { id: 'TS2', name: 'คาบ 2', time: '09:20 - 10:10' },
    { id: 'TS3', name: 'คาบ 3', time: '10:10 - 11:00' },
    { id: 'TS4', name: 'คาบ 4', time: '11:00 - 11:50' },
];
let nextTimeSlotId = timeSlots.length + 1;

export default function handler(req, res) {
    // GET: Fetch all time slots
    if (req.method === 'GET') {
        res.status(200).json(timeSlots);
    }
    // POST: Add a new time slot
    else if (req.method === 'POST') {
        const { name, time } = req.body;
        if (!name || !time) {
            return res.status(400).json({ message: 'Name and time are required' });
        }
        const newSlot = { id: `TS${nextTimeSlotId++}`, name, time };
        timeSlots.push(newSlot);
        res.status(201).json(newSlot);
    }
    // PUT: Update a time slot by ID
    else if (req.method === 'PUT') {
        const { id, name, time } = req.body;
        if (!id || !name || !time) {
            return res.status(400).json({ message: 'ID, name, and time are required for update' });
        }
        const slotIndex = timeSlots.findIndex(s => s.id === id);
        if (slotIndex === -1) {
            return res.status(404).json({ message: 'Time slot not found' });
        }
        timeSlots[slotIndex] = { ...timeSlots[slotIndex], name, time };
        res.status(200).json(timeSlots[slotIndex]);
    }
    // DELETE: Delete a time slot by ID
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Time Slot ID is required for deletion' });
        }
        const initialLength = timeSlots.length;
        timeSlots = timeSlots.filter(s => s.id !== id);
        if (timeSlots.length < initialLength) {
            res.status(200).json({ message: 'Time slot deleted successfully' });
        } else {
            res.status(404).json({ message: 'Time slot not found' });
        }
    }
    // Method Not Allowed
    else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}