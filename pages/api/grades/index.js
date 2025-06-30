import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // สร้างอินสแตนซ์ใหม่ของ PrismaClient

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        switch (req.method) {
            // GET: ดึงระดับชั้นทั้งหมดจากฐานข้อมูล
            case 'GET': { // เพิ่ม block scope
                const grades = await prisma.grade.findMany({
                    orderBy: {
                        name: 'asc',
                    },
                });
                res.status(200).json(grades);
                break;
            } // ปิด block scope

            // POST: สร้างระดับชั้นใหม่
            case 'POST': { // เพิ่ม block scope
                const { name } = req.body;
                if (!name || name.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Grade name is required.' });
                }

                const existingGrade = await prisma.grade.findUnique({
                    where: { name: name.trim() },
                });
                if (existingGrade) {
                    return res.status(409).json({ error: 'Conflict', message: 'Grade with this name already exists.' });
                }

                const newGrade = await prisma.grade.create({
                    data: { name: name.trim() },
                });
                res.status(201).json(newGrade);
                break;
            } // ปิด block scope

            // PUT: อัปเดตระดับชั้นที่มีอยู่
            case 'PUT': { // เพิ่ม block scope
                const updateId = id || req.body.id;
                const { name: newName } = req.body;
                if (!updateId || !newName || newName.trim() === '') {
                    return res.status(400).json({ error: 'Bad Request', message: 'Grade ID and new name are required.' });
                }

                try {
                    const existingGradeWithName = await prisma.grade.findUnique({
                        where: { name: newName.trim() },
                    });
                    if (existingGradeWithName && String(existingGradeWithName.id) !== String(updateId)) {
                        return res.status(409).json({ error: 'Conflict', message: 'Another grade with this name already exists.' });
                    }

                    const updatedGrade = await prisma.grade.update({
                        where: { id: parseInt(updateId) },
                        data: { name: newName.trim() },
                    });
                    res.status(200).json(updatedGrade);
                } catch (updateError) {
                    if (updateError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'Grade not found.' });
                    }
                    throw updateError;
                }
                break;
            } // ปิด block scope

            // DELETE: ลบระดับชั้น
            case 'DELETE': { // เพิ่ม block scope
                const deleteId = id;
                if (!deleteId) {
                    return res.status(400).json({ error: 'Bad Request', message: 'Grade ID is required for deletion.' });
                }
                try {
                    await prisma.grade.delete({
                        where: { id: parseInt(deleteId) },
                    });
                    res.status(200).json({ message: 'Grade deleted successfully.' });
                } catch (deleteError) {
                    if (deleteError.code === 'P2025') {
                        return res.status(404).json({ error: 'Not Found', message: 'Grade not found.' });
                    }
                    if (deleteError.code === 'P2003') {
                        return res.status(409).json({ error: 'Conflict', message: 'Cannot delete grade because it is linked to existing students.' });
                    }
                    throw deleteError;
                }
                break;
            } // ปิด block scope

            default: { // เพิ่ม block scope
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
                break;
            } // ปิด block scope
        }
    } catch (error) {
        console.error('API Error (grades):', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message || 'An unexpected error occurred.' });
    } finally {
        await prisma.$disconnect();
    }
}
