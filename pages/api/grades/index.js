// This is a mock database for grades.
let grades = [
    { id: 'G10', name: 'ม.4' },
    { id: 'G11', name: 'ม.5' },
    { id: 'G12', name: 'ม.6' },
];
let nextGradeId = grades.length + 1;

export default function handler(req, res) {
    // Handle GET request to fetch all grades
    if (req.method === 'GET') {
        res.status(200).json(grades);
    }
    // Handle POST request to add a new grade
    else if (req.method === 'POST') {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Grade name is required' });
        }
        const newGrade = { id: `G${nextGradeId++}`, name };
        grades.push(newGrade);
        res.status(201).json(newGrade);
    }
    // Handle PUT request to update an existing grade
    else if (req.method === 'PUT') {
        const { id, name } = req.body;
        if (!id || !name) {
            return res.status(400).json({ message: 'ID and name are required for update' });
        }
        const gradeIndex = grades.findIndex(g => g.id === id);
        if (gradeIndex === -1) {
            return res.status(404).json({ message: 'Grade not found' });
        }
        grades[gradeIndex].name = name;
        res.status(200).json(grades[gradeIndex]);
    }
    // Handle DELETE request to delete a grade
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: 'Grade ID is required for deletion' });
        }
        const initialLength = grades.length;
        grades = grades.filter(g => g.id !== id);
        if (grades.length < initialLength) {
            res.status(200).json({ message: 'Grade deleted successfully' });
        } else {
            res.status(404).json({ message: 'Grade not found' });
        }
    }
    // Handle other HTTP methods
    else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}