// This is a mock database for teachers.
let teachers = [
    { id: 'T001', name: 'ครูสมศรี' },
    { id: 'T002', name: 'ครูสมชาย' },
    { id: 'T003', name: 'ครูมานี' },
];
let nextTeacherId = teachers.length + 1;

export default function handler(req, res) {
    // GET: Fetch all teachers
    if (req.method === 'GET') {
        res.status(200).json(teachers);
    }
    // POST: Add a new teacher
    else if (req.method === 'POST') {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Teacher name is required' });
        }
        const newTeacher = { id: `T${nextTeacherId++}`, name };
        teachers.push(newTeacher);
        res.status(201).json(newTeacher);
    }
    // UPDATE: Update an existing teacher by ID
    else if (req.method === 'PUT') {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(400).json({ message: 'ID and name are required for update' });
        }
        const teacherIndex = teachers.findIndex(t => t.id === id);
        if (teacherIndex === -1) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        teachers[teacherIndex].name = name;
        res.status(200).json(teachers[teacherIndex]);
    }
    // DELETE: Delete a teacher by ID
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Teacher ID is required for deletion' });
        }
        const initialLength = teachers.length;
        teachers = teachers.filter(t => t.id !== id);
        if (teachers.length < initialLength) {
            res.status(200).json({ message: 'Teacher deleted successfully' });
        } else {
            res.status(404).json({ message: 'Teacher not found' });
        }
    }
    // Method Not Allowed
    else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}