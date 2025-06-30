// This is a mock database for lab rooms
let rooms = [
    { id: 'R1', name: 'Lab 1 (ห้องปฏิบัติการ 1)' },
    { id: 'R2', name: 'Lab 2 (ห้องปฏิบัติการ 2)' },
    { id: 'R3', name: 'Lab 3 (ห้องปฏิบัติการ 3)' },
];

export default function handler(req, res) {
    if (req.method === 'GET') {
        // Return the list of all rooms
        res.status(200).json(rooms);
    } else {
        // Only GET method is supported for this mock API
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}